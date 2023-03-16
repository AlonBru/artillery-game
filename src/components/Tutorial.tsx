import styled from 'styled-components';

import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import { useSimulatedConnection } from '../hooks/useSimulatedConnection';
import { connectionContext } from '../hooks/useConnection';

import { useEffect, useState } from 'react';
import { CommandModeChangeEvent, UnitPlacedEvent, useSubscribeToGameEvent } from '../helpers/customEvents';
import { GameConditions, stages } from './tutorialStages';

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

export function Tutorial ( { exitTutorial }: { exitTutorial(): void; } ) {


  const [ currentStageIndex, setStageIndex ] = useState( 0 );
  const {
    text,
    highlightedElementId,
    withNextButton,
    moveNextOn,
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

      const stageToAdvance = moveNextOn === type;
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

          const advanceStage = moveNextOn === type;
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
