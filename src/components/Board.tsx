import { SetStateAction, Dispatch } from 'react';
import styled from 'styled-components';
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
const Crater = styled.div`
  width: 66%;
  height: 66%;
  margin: auto;
  background: black;
  border-radius: 50%;
`;
const Marker = styled.div`
  margin: auto;
  text-align: center;
  color: darkred;
  font-family: serif;
  font-size: 2rem;
  position: absolute;
  width: 100%;
  top:50%;
  pointer-events: none;
  transform: translateY(-50%);
`;
type BoardProps = {
  commandMode: CommandMode;
  cursor:Vector2|null;
  setCursor:Dispatch<SetStateAction<Vector2|null>>;
  board:Board;
  playerPosition:Vector2|null;
};

export function Board ( {
  commandMode,
  playerPosition,
  cursor,
  setCursor,
  board
}: BoardProps ) {

  return <BoardRoot>
    {board.map( ( column, x ) => <BoardColumn key={x}>
      {column.map( ( item, y ) => {

        const marked = x === cursor?.x && y === cursor?.y;
        return <BoardCell
          commandMode={commandMode}
          playerPosition={playerPosition}
          x={x}
          y={y}
          key={`${x}+${y}`}
          onClick={() => {

            setCursor( {
              x,
              y
            } );

          }}>
          <>
            { marked && <Marker>X</Marker>}
            {item === 'PLAYER' && <Player />}
            {item === 'CRATER' && <Crater />}
          </>
        </BoardCell>;

      } )}
    </BoardColumn> )}
  </BoardRoot>;

}
