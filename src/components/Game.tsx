import { ConnectionProvider } from '../hooks/useConnection';
import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';

export function Game () {

  return <ConnectionProvider>
    <GameLogicProvider>
      <GameUI />
    </GameLogicProvider>
  </ConnectionProvider>;

}
