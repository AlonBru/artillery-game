import styled from 'styled-components';

import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import { useSimulatedConnection } from '../hooks/useSimulatedConnection';
import { connectionContext } from '../hooks/useConnection';

import { useEffect, useState } from 'react';
import { battleGridId, CraterClassName, lastKnownPositionId } from './Board';
import { communicationDisplayId, reloadButtonId } from './CommandPanel';
import { CommandMessage, PositionMessage } from '../helpers/Message';
import { commandSelectorId } from './CommandSelector';
import { BOARD_SIZE } from '../constants';
import { CommandModeChangeEvent, UnitPlacedEvent, useSubscribeToGameEvent } from '../helpers/customEvents';

const darkOverlayZindex = 4;
const TutorialOverlay = styled.div`
  position: absolute;
  background: #000000aa;
  width: 100%;
  height: 100%;
  top:0;
  z-index: ${darkOverlayZindex};
`;
const TextContainer = styled.div`
  position: relative;
  background: white;
  color: black;
  padding:10px;
  margin:10px;
  border-radius: 5px;
  min-height: 20px;
  display: flex; 
  justify-content: space-between;
  align-items: center;
  white-space: pre-wrap;
`;
type GameConditions = {
  commandMode:SelectableCommandMode;
  isUnitPlaced:boolean
}

type TutorialStage = {
  highlightedElementId?:string;
  text: string;
  withNextButton?:boolean;
  doOnMessage?:GameMessage['type'];
  eventToFireOnNext?:GameMessage;
  autoSkipConditions?:Partial<GameConditions>;
  allowNextConditions?:Partial<GameConditions>;
  disableInteractionWithHighlight?:true;
}
const stages :Array<TutorialStage> = [

  {
    text: 'Welcome to unnamed artillery game!',
    withNextButton: true
  },
  {
    text: 'The aim of the game is to destroy the enemy unit while avoiding the same fate for your unit.',
    withNextButton: true
  },
  {
    text: 'First, let\'s get to know the controls:',
    withNextButton: true
  },
  {
    text: `On the left is the battle grid.
It is a representation of the battle field.
On it will be displayed your unit and other elements that are in the field.`,
    withNextButton: true,
    highlightedElementId: battleGridId,
    disableInteractionWithHighlight: true
  },
  {
    text: `Let's deploy your unit. 
Click the grid square on which you'd like to deploy.
Units can only deploy on the bottom row, which is highlighted at the start of the game.`,
    highlightedElementId: battleGridId,
    autoSkipConditions: {
      isUnitPlaced: true
    }
  },
  {
    text: 'Great, notice your unit is on the board now.',
    highlightedElementId: battleGridId,
    withNextButton: true
  },
  {
    text: `Notice this screen, it provides you with information you can use.
Right now it says 'awainting an update from the field'.
This means your opponent has not made a move yet in this turn.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true
  },
  {
    text: `The turns in the game take effect at the same time.
This means that once you have made your move, you will need to wait for your opponent to make their.
Then, both moves will take place and you will both see the results of the turn. 
For the time being the tutorial will move right ahead as if your opponent is very quick to respond.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true,
    eventToFireOnNext: new CommandMessage( null )
  },
  {
    text: `Now your opponent has deployed their unit and the game can begin.
They do not see where you placed your unit, and you don't see their position. 
Your status screen tells you that you are ready to go, and is requesting your command.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true,
  },
  {
    text: `Notice below the status screen your command mode selector.
It should be set to issue a MOVE command. 
`,
    highlightedElementId: commandSelectorId,
    withNextButton: true,
    allowNextConditions: {
      commandMode: 'MOVE'
    }
  },
  {
    text: `A MOVE command can be issued using the battle grid.
Your unit can move to the adjacent grid squares, highlighted on the battle grid.
Try issuing a MOVE command by clicking a highlighted grid square.
`,
    highlightedElementId: battleGridId,
    doOnMessage: 'command',
    eventToFireOnNext: new CommandMessage( null ),
  },
  {
    text: `Your unit has moved to the selected square.
`,
    highlightedElementId: battleGridId,
    withNextButton: true,
    disableInteractionWithHighlight: true

  },
  {
    text: `Now let's explore the other commands at your disposal.
You can change command modes by clicking the command mode selector. 
Please select the FIRE mode to continue.
  `,
    highlightedElementId: commandSelectorId,
    eventToFireOnNext: new CommandMessage( null ),
    withNextButton: true,
    allowNextConditions: {
      commandMode: 'FIRE'
    }
  },
  {
    text: `You can select any highlighted square to fire on.
You can never fire on your own position. 
  `,
    highlightedElementId: battleGridId,
    eventToFireOnNext: new PositionMessage( { x: BOARD_SIZE - 1,
      y: Math.round( Math.random() * BOARD_SIZE ) } ),
    doOnMessage: 'command'
  },
  {
    text: `Notice the position you have fired on is now marked by an X.
This is now a shelled area, which cannot be moved into.
This can be used to block enemy movement.
`,
    highlightedElementId: CraterClassName,
    withNextButton: true,
  },
  {
    text: `Note as well the triangle that appeared on the screen. 
It will appear when you shoot, and mark where the enemy unit is at that time.
The enemy will also be able to see your position when they shoot, of course.
`,
    highlightedElementId: lastKnownPositionId,
    withNextButton: true,
  },
  {
    text: `After you shoot, you will have to reload before you can shoot again.
Your communication screen will tell you your shell is spent and you will not be able to select the FIRE mode,
instead you will have the RELOAD mode available.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true,
  },
  // Add a move when not loaded stage ( player gets shot at)
  {
    text: `Select the RELOAD mode.
The button under the selector will light up, and you can use it to reload your unit's cannon.
`,
    highlightedElementId: commandSelectorId,
    withNextButton: true,
    allowNextConditions: {
      commandMode: 'RELOAD'
    }
  },
  {
    text: `Click the button to reload.
`,
    highlightedElementId: reloadButtonId,
    eventToFireOnNext: new CommandMessage( null ),
    doOnMessage: 'command'

  },
  {
    text: 'You are now reloaded and are able to fire again.',
    highlightedElementId: communicationDisplayId,
    withNextButton: true
  },
  {
    text: 'You know the basics. Go get them tiger!',
  },
];


export function Tutorial ( { exitTutorial }: { exitTutorial(): void; } ) {


  const [ currentStageIndex, setStageIndex ] = useState( 0 );
  const {
    text,
    highlightedElementId,
    withNextButton,
    doOnMessage,
    eventToFireOnNext: fireOnNext,
    autoSkipConditions,
    allowNextConditions,
    disableInteractionWithHighlight
  } = stages[currentStageIndex];
  const [ currentConditions, setCurrentConditions ] = useState<GameConditions>( {
    commandMode: 'MOVE',
    isUnitPlaced: false
  } );

  const {
    fireMessage,
    addDataConnectionEventListener
  } = useSimulatedConnection( {
    onDisconnect: exitTutorial,
    handleSentMessage: ( { type } ) => {

      const stageToAdvance = doOnMessage === type;
      if ( stageToAdvance ) {

        // setStageIndex( stageToAdvance );

      }

    }
    ,
  } );
  useEffect(
    () => {

      function highlight ( identifier:string ):()=>void {


        const elementToHighlight = document.getElementById( identifier ) ||
        document.getElementsByClassName( identifier )?.[0] as HTMLElement;
        if ( !elementToHighlight ) {

          throw new Error( `Element with id or class ${identifier} was not found` );

        }
        const prevZIndex = elementToHighlight?.style.zIndex;
        elementToHighlight.style.zIndex = `${darkOverlayZindex + 1}`;

        const style = getComputedStyle( elementToHighlight );
        const prevPosition = elementToHighlight?.style.position;
        elementToHighlight.style.position = prevPosition || ( style.position !== 'static'
          ? style.position
          : null ) || 'relative';

        const { pointerEvents } = elementToHighlight.style;

        elementToHighlight.style.pointerEvents = disableInteractionWithHighlight
          ? 'none'
          : pointerEvents;


        return function cleanUp () {

          elementToHighlight.style.zIndex = prevZIndex;
          elementToHighlight.style.position = prevPosition;
          elementToHighlight.style.pointerEvents = pointerEvents;

        };

      }
      if ( highlightedElementId ) {

        return highlight( highlightedElementId );

      }

    },
    [ currentStageIndex ]
  );
  useEffect(
    () => {

      if ( autoSkipConditions ) {

        const moveOn = getConditionState( autoSkipConditions );
        if ( moveOn ) {

          nextStage();

        }

      }

    },
    [ currentStageIndex,
      currentConditions ]
  );

  useSubscribeToGameEvent<typeof CommandModeChangeEvent>(
    'commandModeChange',
    ( { detail: { mode } } ) => {

      setCurrentConditions( ( state ) => ( { ...state,
        commandMode: mode } ) );

    },
    []
  );
  useSubscribeToGameEvent<typeof UnitPlacedEvent>(
    'unitPlaced',
    ( ) => {

      setCurrentConditions( ( state ) => ( { ...state,
        isUnitPlaced: true } ) );

    },
    []
  );
  function getConditionState ( conditions:Partial<GameConditions> ):boolean {

    let moveOn = true;
    for ( const x in conditions ) {

      if ( conditions[x as keyof GameConditions] !== currentConditions[x as keyof GameConditions] ) {

        moveOn = false;
        break;

      }

    }
    return moveOn;

  }

  function nextStage () {

    setStageIndex( ( index ) => index + 1 );
    fireOnNext && fireMessage( fireOnNext );

  }
  const disableNext = allowNextConditions && !getConditionState( allowNextConditions );

  return <div>TUTORIAL
    <button onClick={exitTutorial}>tutorial</button>
    <connectionContext.Provider
      value={{
        /* eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function */
        sendMessage: ( { type } ) => {

          const advanceStage = doOnMessage === type;
          if ( advanceStage ) {

            nextStage();

          }

        },
        addDataConnectionEventListener,
        disconnect: exitTutorial

      }}

    >
      <GameLogicProvider>
        <GameUI />
      </GameLogicProvider>
    </connectionContext.Provider>
    <TutorialOverlay>
      <TextContainer>
        <div>
          {text}
        </div>
        {withNextButton && <button
          onClick={nextStage}
          disabled={disableNext}
        >next</button>}
        {currentStageIndex === stages.length - 1 && <button onClick={exitTutorial}>finish</button>}
      </TextContainer>
    </TutorialOverlay>

  </div>;

}
