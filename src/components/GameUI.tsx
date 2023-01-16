import {
  useEffect, useState
} from 'react';
import { CommandPanel } from './CommandPanel';
import { Board } from './Board';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameManager';

const Root = styled.section`
  display: grid;
  grid-template-columns: max(400px, 50%) 50%;
  background: #333;
  grid-column-gap: 20px;
  padding:10px;
`;


export function GameUI () {

  const {
    status,
    sendEvent,
    playerPosition,
    board
  } = useGameLogic();
  const [ cursor, setCursor ] = useState<Vector2 | null>( null );
  const [ commandMode, setCommandMode ] = useState<CommandMode>( 'INITIAL' );
  useEffect(
    () => {

      setCursor( null );

    },
    [ commandMode ]
  );
  useEffect(
    () => {

      if ( playerPosition !== null ) {

        setCommandMode( 'MOVE' );

      }
      setCursor( null );

    },
    [ board ]
  );
  function dispatch () {

    if ( commandMode === 'RELOAD' ) {

      sendEvent( {
        type: commandMode
      } );
      return;

    }
    if ( !cursor ) {

      throw new Error( 'action dispatched without selecting a target' );

    }
    sendEvent( {
      target: cursor,
      type: commandMode
    } );

  }

  return (
    <div>
      <span> {status}</span>
      <Root
        onContextMenu={( e ) => {

          e.preventDefault();

        }}
      >
        <Board
          commandMode={commandMode}
          setCursor={setCursor}
          cursor={cursor}
          board={board}
          playerPosition={playerPosition} />
        <CommandPanel
          dispatch={dispatch}
          setCommandMode={setCommandMode}
          cursor={cursor}
          commandMode={commandMode} />
      </Root>
    </div>
  );

}
