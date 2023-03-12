import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import { SimulatedConnectionProvider } from '../hooks/useSimulatedConnection';

export function Tutorial ( { exitTutorial }: { exitTutorial(): void; } ) {

  return <div>tutorial
    <button onClick={exitTutorial}>tutorial</button>
    <SimulatedConnectionProvider
      onDisconnect={exitTutorial}
      handleSentMessage={() => {}}
    >
      <GameLogicProvider>
        <GameUI />
      </GameLogicProvider>
    </SimulatedConnectionProvider>
  </div>;

}
