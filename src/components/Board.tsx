import {
  useReducer, Reducer, useRef, SetStateAction, Dispatch
} from 'react';
import styled from 'styled-components';
import { BOARD_SIZE } from '../constants';
import { BoardCell } from './BoardCell';
import { BoardColumn } from './styled';

const BoardRoot = styled.main`
  margin: auto;
  width: 400px;
  height: 400px;
  display: grid;
  grid-template-columns: repeat(8,1fr);
  grid-column-gap: 2px;
  background: darkred;
`;
const Player = styled.div`
  width: 66%;
  height: 66%;
  margin: auto;
  background: red;
  border-radius: 50%;
`;

function getFreshBoard ():Board {

  return new Array( BOARD_SIZE ).fill( null )
  .map( () => new Array( BOARD_SIZE ).fill( null ) );

}
type BoardProps = {
  commandMode: CommandMode;
  setCommandMode:Dispatch<SetStateAction<CommandMode>>
};

export function Board ( {
  commandMode,
  setCommandMode
}: BoardProps ) {

  const playerPositionRef = useRef<Vector2 | null>( null );

  const [ board, dispatch ] = useReducer<Reducer<Board, BoardAction>>(
    ( boardState, { position, type } ) => {

      const newBoard = [ ...boardState ];
      if ( type === 'INITIAL' ) {

        newBoard[position.x][position.y] = 'PLAYER';
        playerPositionRef.current = {
          x: position.x,
          y: position.y,
        };
        setCommandMode( 'MOVE' );

      }
      if ( type === 'MOVE' ) {

        const playerPosition = playerPositionRef.current as Vector2;
        newBoard[playerPosition.x][playerPosition.y] = null;
        newBoard[position.x][position.y] = 'PLAYER';
        playerPosition.x = position.x;
        playerPosition.y = position.y;


      }
      return newBoard;

    },
    getFreshBoard()
  );
  return <BoardRoot>
    {board.map( ( column, x ) => <BoardColumn key={x}>
      {column.map( ( item, y ) => <BoardCell
        commandMode={commandMode}
        playerPosition={playerPositionRef.current}
        x={x}
        y={y}
        key={`${x}+${y}`}
        onClick={() => {

          dispatch( {
            position: {
              x,
              y
            },
            type: commandMode
          } );

        }}>

        {item && <Player />}
      </BoardCell> )}
    </BoardColumn> )}
  </BoardRoot>;

}
