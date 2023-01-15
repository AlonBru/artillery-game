import {
  ReducerWithoutAction, useEffect, useReducer, useRef, useState
} from 'react';
import styled from 'styled-components';
import { CommandPanel } from './components/CommandPanel';
import { Board } from './components/Board';
import { getFreshBoard } from './helpers/board';
import { BOARD_SIZE } from './constants';

const Root = styled.section`
  display: grid;
  grid-template-columns: max(400px, 50%) 50%;
  background: #333;
  grid-column-gap: 20px;
  padding:10px;
`;

function App () {

  const playerPositionRef = useRef<Vector2 | null>( null );
  const [ cursor, setCursor ] = useState<Vector2|null>( null );
  const [ commandMode, setCommandMode ] = useState<CommandMode>( 'INITIAL' );
  const [ loaded, setLoaded ] = useState<boolean>( true );
  const [ board, dispatch ] = useReducer<ReducerWithoutAction<Board>>(
    ( boardState ) => {

      const command = commandMode;
      if ( command === 'RELOAD' ) {

        setLoaded( true );
        setCommandMode( 'MOVE' );
        return boardState;

      }
      if ( !cursor ) {

        throw new Error( 'action dispatched without selecting a target' );

      }
      const newBoard = [ ...boardState ];
      if ( command === 'INITIAL' ) {

        newBoard[cursor.x][cursor.y] = 'PLAYER';
        playerPositionRef.current = {
          x: cursor.x,
          y: cursor.y,
        };
        setCommandMode( 'MOVE' );

      }
      if ( command === 'MOVE' ) {

        const playerPosition = playerPositionRef.current as Vector2;
        newBoard[playerPosition.x][playerPosition.y] = null;
        newBoard[cursor.x][cursor.y] = 'PLAYER';
        playerPosition.x = cursor.x;
        playerPosition.y = cursor.y;


      }
      if ( command === 'FIRE' ) {

        setLoaded( false );
        setCommandMode( 'MOVE' );

      }
      return newBoard;

    },
    getFreshBoard( BOARD_SIZE )
  );
  useEffect(
    () => {

      setCursor( null );

    },
    [ commandMode,
      board ]
  );

  return (
    <Root>
      <Board
        commandMode={commandMode}
        setCursor={setCursor}
        cursor={cursor}
        board={board}
        playerPosition={playerPositionRef.current}
      />
      <CommandPanel
        dispatch={dispatch}
        setCommandMode={setCommandMode}
        loaded={loaded}
        cursor={cursor}
        commandMode={commandMode}
      />
    </Root>
  );

}

export default App;


