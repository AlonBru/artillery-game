import { ConnectionProvider } from '../hooks/useConnection';
import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';

export function Game () {

  return <div
    className="GameRoot"
    style={{
      position: 'relative',
      minHeight: 500,
      margin: 'auto'

    }}
  >
    <ConnectionProvider>
      <GameLogicProvider>
        <GameUI />
      </GameLogicProvider>
    </ConnectionProvider>
  </div>;

}
