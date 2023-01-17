import {
  ComponentPropsWithoutRef,
  createContext,
  Reducer,
  useContext,
  useEffect, useReducer, useRef, useState
} from 'react';
import { getFreshBoard } from '../helpers/board';
import { BOARD_SIZE } from '../constants';
import { useConnectionContext } from './useConnection';
import { useLastKnownPosition } from './useLastKnownPosition';


type GameStatus = 'IDLE' | 'RECEIVED' | 'SENT' | 'WORKING';

type GameLogic = {
  sendCommand( move:Command ):void;
  status: GameStatus;
  board:Board;
  loaded:boolean;
  awaitingPlayerInput:boolean;
  playerPosition: Vector2|null;
  lastKnown: Vector2|null;
};
type PlayerAction = {
  own:true,
  move: Command;

}
type PeerAction = {
  own: false;
  move:FireCommand|null;
};

type Action = PlayerAction|PeerAction;

const gameLogicContext = createContext<GameLogic|null>( null );

export function useGameLogic ():GameLogic {

  const context = useContext( gameLogicContext );

  if ( context === null ) {

    throw new Error( 'tried to access useGameLogic() without a <GameLogicProvider/>' );

  }
  return context;

}

export function GameLogicProvider ( { children }:Pick<ComponentPropsWithoutRef<'div'>, 'children'> ) {


  const conn = useConnectionContext();
  const playerPositionRef = useRef<Vector2 | null>( null );
  const [ loaded, setLoaded ] = useState<boolean>( true );
  const lastKnown = useLastKnownPosition( );

  const [ board, dispatchBoard ] = useReducer<Reducer<Board, UICommand[]>>(
    ( boardState, actions ) => actions.reduce<Board>(
      ( board, command ) => {

        const { type, target: { x, y } } = command;

        const playerPosition = playerPositionRef.current as Vector2;
        switch ( type ) {

          case 'INITIAL':

            board[x][y] = 'PLAYER';
            playerPositionRef.current = {
              x,
              y,
            };

            break;
          case 'MOVE':

            board[playerPosition.x][playerPosition.y] = null;
            board[x][y] = 'PLAYER';
            playerPosition.x = x;
            playerPosition.y = y;

            break;
          case 'FIRE':

            board[x][y] = 'CRATER';

            break;

          default:
            break;

        }

        return board;


      },
      [ ...boardState ]
    ),
    getFreshBoard( BOARD_SIZE )
  );
  type Moves = {
    player: Command;
    peer: Command|null;
  } ;

  const [ { status }, dispatchGameAction ] = useReducer<Reducer<{ status: GameStatus; moves: Partial<Moves>| null; }, Action>>(
    ( { status: state, moves }, action ) => {

      const newStatus = action.own
        ? handleOwnMove( state )
        : handlePeerMove( state );
      const newMoves:Partial<Moves> = {
        ...moves
      };
      if ( action.own ) {

        newMoves.player = action.move;

      } else {

        newMoves.peer = action.move;

      }

      if ( newStatus !== 'WORKING' ) {

        return {
          status: newStatus,
          moves: newMoves
        };

      }

      const handledPlayerCommandUI = handlePlayerCommand( newMoves.player as PlayerAction['move'] );
      const handledPeerCommandUI = handlePeerCommand( newMoves.peer as PeerAction['move'] );
      const commands:UICommand[] = [];
      if ( !handledPlayerCommandUI ) {

        commands.push( newMoves.player as UICommand );

      }
      if ( !handledPeerCommandUI ) {

        commands.push( newMoves.peer as UICommand );

      }
      dispatchBoard( commands );
      return {
        status: 'IDLE',
        moves: null
      };

    },
    {
      status: 'IDLE',
      moves: null
    }
  );
  useEffect(
    () => {

      function handleMessage ( message:GameMessage ) {

        switch ( message.type ) {

          case 'command':
            dispatchGameAction( {
              own: false,
              move: message.data as FireCommand
            } );
            break;
          default:
            break;

        }

      }
      conn.on(
        'data',
        ( data ) => {

          handleMessage( data as GameMessage );

        }
      );
      return () => {

        conn.removeListener( 'data' );

      };

    },
    []
  );

  function sendCommand ( command: Command ) {


    conn.send( {
      type: 'command',
      data: command.type === 'FIRE'
        ? command
        : null
    } );

    dispatchGameAction( {
      own: true,
      move: command
    } );

  }
  return <gameLogicContext.Provider value={{
    sendCommand,
    status,
    board,
    loaded,
    awaitingPlayerInput: status === 'IDLE' || status === 'RECEIVED',
    playerPosition: playerPositionRef.current,
    lastKnown
  }}>
    {children}
  </gameLogicContext.Provider>;
  function handleOwnMove ( currentsState: GameStatus ): GameStatus {

    switch ( currentsState ) {

      case 'IDLE':

        return 'SENT';

      case 'RECEIVED':

        return 'WORKING';

      default:
        throw new Error( `Tried sending when the state is:"${currentsState}"` );

    }

  }
  function handlePeerMove ( currentsState: GameStatus ): GameStatus {

    switch ( currentsState ) {

      case 'IDLE':

        return 'RECEIVED';

      case 'SENT':

        return 'WORKING';

      default:
        throw new Error( `Received a move when the state is:"${currentsState}"` );
        break;

    }

  }
  function handlePlayerCommand ( { type }:PlayerAction['move'] ):boolean {

    switch ( type ) {

      case 'RELOAD':
        setLoaded( true );
        return true;
      case 'FIRE':
        setLoaded( false );
        return false;

      default:
        return false;

    }

  }
  function handlePeerCommand ( command:PeerAction['move'] ):boolean {

    if ( command === null ) {

      return true;

    }
    const { target: { x, y } } = command;
    const hasHitPlayer = x === playerPositionRef.current?.x &&
    y === playerPositionRef.current?.y;
    if ( hasHitPlayer ) {
      // handle hit
    }
    return false;

  }

}
