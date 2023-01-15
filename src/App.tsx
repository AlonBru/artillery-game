import {
  useReducer, useState, Reducer, useRef
} from 'react';
import styled from 'styled-components';

const BoardRoot = styled.main`
  margin: auto;
  width: 400px;
  height: 400px;
  display: grid;
  grid-template-columns: repeat(8,1fr);
  grid-column-gap: 2px;
  background: darkred;
`;
const BoardColumn = styled.div`
  display: grid;
  grid-template-rows: repeat(8,1fr);
  grid-row-gap: 2px;
  width: 100%;
  height: 100%;
`;

const BoardCell = styled.div`
  width: 100%;
  height: 100%;
  background: navy;
  :hover{
    outline: yellow solid 1px;
  }
  :nth-child(2n){
    background-color: skyblue;
  }
  ${BoardColumn}:nth-child(2n) & {
    background: skyblue;
    :nth-child(2n){
      background: navy;
    }

  }
  
  
`;
const Player = styled.div`
  width: 66%;
  height: 66%;
  margin: auto;
  background: red;
  border-radius: 50%;
`;

type BoardAction = {
  position:Vector2;
  type:CommandMode;
}
type Item = 'PLAYER'|null
type Board = Array<Item[]>

function App () {

  const playerPositionRef = useRef<Vector2|null>( null );
  const [ commandMode, setCommandMode ] = useState<CommandMode>( 'INITIAL' );
  const [ board, dispatch ] = useReducer<Reducer<Board, BoardAction>>(
    ( board, { position, type } ) => {

      const newBoard = [ ...board ];
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

  return (
    <BoardRoot>
      {board.map( ( column, x ) => <BoardColumn key={x}>
        {column.map( ( item, y ) => <BoardCell
          key={`${x}+${y}`}
          onClick={() => {

            console.log(
              board,
              x,
              y
            );
            dispatch( {
              position: { x,
                y },
              type: commandMode
            } );

          }}>

          {item && <Player/>}
        </BoardCell> )
        }
      </BoardColumn> )}
    </BoardRoot>
  );

}

export default App;

function getFreshBoard ():Board {

  return new Array( 8 ).fill( null )
  .map( () => new Array( 8 ).fill( null ) );

}
