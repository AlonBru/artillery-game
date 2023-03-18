import { ConnectionProvider } from '../hooks/useConnection';
import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import styled from 'styled-components';
import { useState } from 'react';
import { Tutorial } from './Tutorial';

const Root = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  height:100vh;
  height:100dvh;
`;
const GameContainer = styled.div`
  position: relative;
  min-height: 500;
  width: 100%;
`;

const Credits = styled.footer`
  font-size: 12px;
  text-align: center;
`;

export function Game () {

  const [ isTutorial, setTutorial ] = useState( false );

  return <Root>
    <GameContainer>
      {!isTutorial
        ? <ConnectionProvider
          startTutorial={() => setTutorial( true )}
        >
          <GameLogicProvider>
            <GameUI />
          </GameLogicProvider>
        </ConnectionProvider>
        : <Tutorial exitTutorial={() => setTutorial( false )}/>
      }
    </GameContainer>
    <Credits>
      The Untitled Artillery Game was created by AlonBru. You are welcome to check out the source code or contribute <a
        href="https://github.com/AlonBru/artillery-game"
        target="_blank" rel="noreferrer"
      >
        here
      </a>
    </Credits>
  </Root>;

}
