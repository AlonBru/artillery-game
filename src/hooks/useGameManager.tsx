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


type GameLogic = {
  sendCommand( move:Command ):void;
  status: GameStatus;
  board:Board;
  loaded:boolean;
  awaitingPlayerInput:boolean;
  playerPosition: Vector2|null;
  lastKnown: Vector2|null;
  endGame:false|EndGameStatus;
};
type PlayerAction = {
  own:true,
  move: Command;

}
type PeerAction = {
  own: false;
  move:FireCommand|null;
};
type EndGameAction = {
  own: boolean;
  move: {
    type: 'defeat',
    target:Vector2
  };

};

type Action = PlayerAction|PeerAction|EndGameAction;

const gameLogicContext = createContext<GameLogic|null>( null );
const endgameStates:Readonly<EndGameStatus[]> = [ 'DEFEAT',
  'VICTORY' ];

type MovesList = {
  player: Command;
  peer: Command|null;
} ;
type GameState = {
  status: GameStatus;
  moves: Partial<MovesList> | null;
};

type BoardChange = UICommand | EndGameAction['move'];
export function useGameLogic ():GameLogic {

  const context = useContext( gameLogicContext );

  if ( context === null ) {

    throw new Error( 'tried to access useGameLogic() without a <GameLogicProvider/>' );

  }
  return context;

}

export function GameLogicProvider ( { children }:Pick<ComponentPropsWithoutRef<'div'>, 'children'> ) {


  const { addDataConnectionEventListener, sendMessage: send } = useConnectionContext();
  const playerPositionRef = useRef<Vector2 | null>( null );
  const [ loaded, setLoaded ] = useState<boolean>( true );
  const lastKnown = useLastKnownPosition( );


  const [ board, dispatchBoard ] = useReducer<Reducer<Board, BoardChange[]>>(
    ( boardState, actions ) => actions.reduce<Board>(
      ( board, command ) => {

        const { type, target: { x, y } } = command;

        switch ( type ) {

          case 'defeat':
            board[x][y] = 'DESTROYED';
            break;

          case 'INITIAL':

            board[x][y] = 'PLAYER';
            playerPositionRef.current = {
              x,
              y,
            };

            break;
          case 'MOVE':

            board[x][y] = 'PLAYER';

            break;
          case 'FIRE':

            board[x][y] = hasHitPlayer(
              x,
              y
            )
              ? 'DESTROYED'
              : 'CRATER';

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


  const [ { status }, dispatchGameAction ] = useReducer<Reducer<GameState, Action>>(
    ( { status: state, moves }, action ) => {

      if ( isEndGameAction( action ) ) {


        return handleEndGame( action );

      }

      const newStatus = action.own
        ? handleOwnMove( state )
        : handlePeerMove( state );
      const newMoves:Partial<MovesList> = {
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
      const { uiHandled: handledPeerCommandUI, hit } = handlePeerCommand( newMoves.peer as PeerAction['move'] );
      const commands:UICommand[] = [];
      if ( !handledPlayerCommandUI ) {

        commands.push( newMoves.player as UICommand );

      }
      if ( !handledPeerCommandUI ) {

        commands.push( newMoves.peer as UICommand );

      }
      dispatchBoard( commands );

      if ( hit ) {

        send( {
          type: 'hit',
          data: playerPositionRef.current as Vector2
        } );
        return { status: 'DEFEAT',
          moves: null };

      }

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
    () => addDataConnectionEventListener(

      ( data:unknown ) => {

        if ( ( data as GameMessage )?.type ) {

          const message = data as GameMessage;
          switch ( message.type ) {

            case 'hit':
              dispatchGameAction( {
                own: false,
                move: {
                  type: 'defeat',
                  target: message.data
                }
              } );
              break;
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

      }
    ),
    []
  );

  function isEndGameAction ( action: Action ):action is EndGameAction {

    return action.move?.type === 'defeat';

  }

  function sendCommand ( command: Command ) {


    send( {
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
    lastKnown,
    endGame: isStatusEndgame( status ) && status
  }}>
    {children}
  </gameLogicContext.Provider>;
  function isStatusEndgame ( status:GameStatus ): status is EndGameStatus {

    return endgameStates.includes( status as EndGameStatus );

  }

  function hasHitPlayer ( x: number, y: number ) {

    return x === playerPositionRef.current?.x &&
      y === playerPositionRef.current?.y;

  }
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
  function handlePlayerCommand ( command:PlayerAction['move'] ):boolean {

    switch ( command.type ) {

      case 'RELOAD':
        setLoaded( true );
        return true;
      case 'FIRE':
        setLoaded( false );
        return false;
      case 'MOVE':
        {

          const playerPosition = playerPositionRef.current as Vector2;
          board[playerPosition.x][playerPosition.y] = null;
          playerPosition.x = command.target.x;
          playerPosition.y = command.target.y;

        }
        return false;

      default:
        return false;

    }

  }
  function handlePeerCommand ( command:PeerAction['move'] ):{hit:boolean, uiHandled:boolean} {

    if ( command === null ) {

      return { hit: false,
        uiHandled: true };

    }
    const { target: { x, y } } = command;
    const playerHit = hasHitPlayer(
      x,
      y
    );
    const message:GameMessage = playerHit
      ? {
        type: 'hit',
        data: {
          x,
          y
        }
      }
      : {
        type: 'position',
        data: playerPositionRef.current as Vector2
      };
    send( message );
    return { hit: playerHit,
      uiHandled: false };

  }
  function handleEndGame ( { move, own }:EndGameAction ):GameState {

    if ( move.target ) {

      dispatchBoard( [ move ] );

    }
    return {
      status: own
        ? 'DEFEAT'
        : 'VICTORY',
      moves: null
    };

  }


}
