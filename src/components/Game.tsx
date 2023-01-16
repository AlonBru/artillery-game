import { ConnectionPage } from './ConnectionPage';
import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';

export function Game () {

  return <ConnectionPage>
    <GameLogicProvider>
      <GameUI />
    </GameLogicProvider>
  </ConnectionPage>;

}
