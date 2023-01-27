import { ConnectionProvider } from '../hooks/useConnection';
import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import styled from 'styled-components';

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

  return <Root>
    <GameContainer>
      <ConnectionProvider>
        <GameLogicProvider>
          <GameUI />
        </GameLogicProvider>
      </ConnectionProvider>
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
