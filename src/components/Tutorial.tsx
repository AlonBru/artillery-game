import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import { useSimulatedConnection } from '../hooks/useSimulatedConnection';

export function Tutorial ( { exitTutorial }: { exitTutorial(): void; } ) {

  const { fireMessage, SimulatedConnectionProvider } = useSimulatedConnection( {
    onDisconnect: exitTutorial,
    handleSentMessage () {},
  } );
  return <div>tutorial
    <button onClick={exitTutorial}>tutorial</button>
    <SimulatedConnectionProvider>
      <GameLogicProvider>
        <GameUI />
      </GameLogicProvider>
    </SimulatedConnectionProvider>

  </div>;

}
