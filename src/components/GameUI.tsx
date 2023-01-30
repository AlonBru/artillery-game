import {
  useEffect, useState
} from 'react';
import { CommandPanel } from './CommandPanel';
import { Board } from './Board';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameManager';

const Root = styled.section<{waitingForPeer:boolean}>`
  display: grid;
  grid-template-columns: max(400px, 50%) auto;
  background: #333;
  grid-column-gap: 20px;
  padding:10px;
  ${( { waitingForPeer } ) => waitingForPeer && `
    cursor: wait;
  `}
`;


export function GameUI () {

  const {
    status,
    sendCommand: sendEvent,
    playerPosition,
    board,
    awaitingPlayerInput,
    endGame
  } = useGameLogic();
  const [ cursor, setCursor ] = useState<Vector2 | null>( null );
  const [ commandMode, setCommandMode ] = useState<CommandMode>( 'INITIAL' );
  useEffect(
    () => {

      if ( !endGame ) {

        setCommandMode( 'INITIAL' );

      }

    },
    [ endGame ]
  );
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
      {import.meta.env.DEV && <span> {status}</span>}
      <Root
        waitingForPeer={!awaitingPlayerInput}
        onContextMenu={( e ) => {

          e.preventDefault();

        }}
      >
        <Board
          commandMode={commandMode}
          setCursor={setCursor}
          cursor={cursor}
          board={board}
          playerPosition={playerPosition}
          dispatch={dispatch}
        />
        <CommandPanel
          dispatch={dispatch}
          setCommandMode={setCommandMode}
          cursor={cursor}
          commandMode={commandMode} />
      </Root>
    </div>
  );

}
