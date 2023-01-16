import {
  ComponentPropsWithoutRef,
  createContext,
  Reducer,
  useContext,
  useEffect, useReducer, useRef, useState
} from 'react';
import { getFreshBoard } from '../helpers/board';
import { BOARD_SIZE } from '../constants';
import { useConnection } from './useConnection';


type GameStatus = 'IDLE' | 'RECEIVED' | 'SENT' | 'WORKING';

type GameLogic = {
  sendEvent( move:Command ):void;
  status: GameStatus;
  board:Board;
  loaded:boolean;
  awaitingPlayerInput:boolean;
  playerPosition: Vector2|null;
};
const gameLogicContext = createContext<GameLogic|null>( null );

export function useGameLogic ():GameLogic {

  const context = useContext( gameLogicContext );

  if ( context === null ) {

    throw new Error( 'tried to access useGameLogic() without a <GameLogicProvider/>' );

  }
  return context;

}

export function GameLogicProvider ( { children }:Pick<ComponentPropsWithoutRef<'div'>, 'children'> ) {

  function handleOwnMove ( currentsState: GameStatus ): GameStatus {

    switch ( currentsState ) {

      case 'IDLE':

        return 'SENT';

      case 'RECEIVED':

        return 'WORKING';

      default:
        throw new Error( `Tried sending when the state is:"${currentsState}"` );
        break;

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

  const conn = useConnection();

  const playerPositionRef = useRef<Vector2 | null>( null );
  const [ loaded, setLoaded ] = useState<boolean>( true );
  type Action = {
    own: boolean;
    move: Command;
  };
  const [ board, dispatchBoard ] = useReducer<Reducer<Board, Action[]>>(
    ( boardState, actions ) => actions.reduce<Board>(
      ( board, { own, move } ) => {

        const command = move.type;
        if ( own ) {

          if ( command === 'RELOAD' ) {

            setLoaded( true );
            return board;

          }
          const cursor = move.target;
          if ( command === 'INITIAL' ) {

            board[cursor.x][cursor.y] = 'PLAYER';
            playerPositionRef.current = {
              x: cursor.x,
              y: cursor.y,
            };

          }

          if ( command === 'MOVE' ) {

            const playerPosition = playerPositionRef.current as Vector2;
            board[playerPosition.x][playerPosition.y] = null;
            board[cursor.x][cursor.y] = 'PLAYER';
            playerPosition.x = cursor.x;
            playerPosition.y = cursor.y;

          }
          if ( command === 'FIRE' ) {

            setLoaded( false );
            console.log( 'implement firing' );

          }

        } else if ( command === 'FIRE' ) {

          console.log( 'implement firing' );

        }
        return board;

      },
      [ ...boardState ]
    ),
    getFreshBoard( BOARD_SIZE )
  );

  const [ { status }, dispatchMove ] = useReducer<Reducer<{ status: GameStatus; moves: Action[]; }, Action>>(
    ( { status: state, moves }, action ) => {

      const newStatus = action.own
        ? handleOwnMove( state )
        : handlePeerMove( state );
      const newMoves = [ ...moves,
        action ];
      if ( newStatus !== 'WORKING' ) {

        return {
          status: newStatus,
          moves: newMoves
        };

      }
      dispatchBoard( newMoves );
      return {
        status: 'IDLE',
        moves: []
      };

    },
    {
      status: 'IDLE',
      moves: []
    }
  );
  useEffect(
    () => {

      conn.on(
        'data',
        ( data ) => {

          dispatchMove( {
            own: false,
            move: data as Command
          } );

        }
      );
      return () => {

        conn.removeListener( 'data' );

      };

    },
    []
  );
  function sendEvent ( move: Command ) {

    conn.send( move );
    dispatchMove( {
      own: true,
      move
    } );

  }
  return <gameLogicContext.Provider value={{
    sendEvent,
    status,
    board,
    loaded,
    awaitingPlayerInput: status === 'IDLE' || status === 'RECEIVED',
    playerPosition: playerPositionRef.current
  }}>
    {children}
  </gameLogicContext.Provider>;

}
