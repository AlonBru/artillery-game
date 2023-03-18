import styled from 'styled-components';

import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import { useSimulatedConnection } from '../hooks/useSimulatedConnection';
import { connectionContext } from '../hooks/useConnection';

import { useEffect, useState } from 'react';
import {
  CommandModeChangeEvent, DeployCommandFiredEvent, useSubscribeToGameEvent
} from '../helpers/customEvents';
import { GameConditions, stages, TutorialStage } from './tutorialStages';
import { CommandMessage, HitMessage, PositionMessage } from '../helpers/Message';

const darkOverlayZindex = 4;
const Root = styled.div`
  --overlay-color:#000000aa;
  position: relative;
  width: 100%;
  height: 100%;
  top:0;
  overflow: hidden;
`;
const TutorialOverlay = styled.div`
  position: absolute;
  background: var(--overlay-color);
  z-index: ${darkOverlayZindex};
  width: 100%;
  height: 100%;
`;
const TutorialOverlayTotal = styled( TutorialOverlay )`
  position: absolute;
  background: var(--overlay-color);
  top:0;
  z-index: ${darkOverlayZindex};
`;

const TextContainer = styled.div`
  position: absolute;
  width: calc(100% - 40px);
  top: 5px;
  left: 10px;
  background: white;
  color: black;
  padding:10px;
  border-radius: 5px;
  min-height: 20px;
  display: flex; 
  justify-content: space-between;
  align-items: center;
  white-space: pre-wrap;
  z-index: ${darkOverlayZindex + 1};
`;

const simulatedEnemyLocation = {
  y: 0,
  x: 1
};
export function Tutorial ( { exitTutorial }: { exitTutorial(): void; } ) {


  const [ currentStageIndex, setStageIndex ] = useState( 0 );
  const {
    text,
    highlightedElementId,
    withNextButton,
    moveNextOn,
    eventToFireOnNext,
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
  useSubscribeToGameEvent<typeof DeployCommandFiredEvent>(
    'unitPlaced',
    ( { detail: { position } } ) => {

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
    eventToFireOnNext && handleMessageToFire( eventToFireOnNext );

  }
  const disableNext = allowNextConditions && !getConditionState( allowNextConditions );

  return <Root>
    {/* TUTORIAL
    <button onClick={exitTutorial}>tutorial</button> */}
    <TextContainer>
      <div>
        {text}
      </div>
      {withNextButton && <button
        onClick={nextStage}
        disabled={disableNext}
        title={disableNext
          ? 'Please follow the instructions to continue'
          : undefined
        }
      >next</button>}
      {currentStageIndex === stages.length - 1 && <button onClick={exitTutorial}>finish</button>}
    </TextContainer>


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

    <ElementHighlighter
      highlightedElementId={highlightedElementId}
      disableInteractionWithHighlight={disableInteractionWithHighlight}
    />

  </Root>;
  function handleMessageToFire ( type:GameMessage['type'] ) {

    let eventToFireOnNext :GameMessage|null = null;
    switch ( type ) {

      case 'position':
        eventToFireOnNext = new PositionMessage( simulatedEnemyLocation );
        break;
      case 'hit':
        eventToFireOnNext = new HitMessage( simulatedEnemyLocation );
        break;
      case 'command':
        eventToFireOnNext = new CommandMessage( null );
        break;
      default:
        break;

    }
    eventToFireOnNext && fireMessage( eventToFireOnNext );

  }

}
type ElementHighlighterProps = Pick<TutorialStage,
  'highlightedElementId'|
  'disableInteractionWithHighlight'
>

function ElementHighlighter ( {
  highlightedElementId,
  disableInteractionWithHighlight,
}:ElementHighlighterProps ) {

  const [ higlightedElement, setHighlightedElement ] = useState<HTMLElement|null>( null );

  useEffect(
    () => {

      function highlight ( identifier:string ):()=>void {


        const elementToHighlight = document.getElementById( identifier ) ||
        document.getElementsByClassName( identifier )?.[0] as HTMLElement;
        if ( !elementToHighlight ) {

          throw new Error( `Element with id or class ${identifier} was not found` );


        }
        setHighlightedElement( elementToHighlight );
        return function cleanUp () {

          setHighlightedElement( null );

        };

      }
      if ( highlightedElementId ) {

        return highlight( highlightedElementId );

      }

    },
    [ highlightedElementId ]
  );
  if ( !higlightedElement ) {

    return <TutorialOverlayTotal/>;

  }
  const {
    x, y, height, width
  } = higlightedElement.getBoundingClientRect();
  return <>

    <TutorialOverlay // top
      style={{
        bottom: `calc( 100% - ${y}px  )`,
        right: `calc(100% - ${x}px - ${width}px`,
      }}
    />
    <TutorialOverlay // right
      style={{
        bottom: `calc( 100% - ${y + height}px  )`,
        left: x + width,
      }}
    />
    <TutorialOverlay // bottom
      style={{
        top: y + height,
        left: x,
      }}
    />
    <TutorialOverlay // left
      style={{
        top: y,
        right: `calc( 100% - ${x}px  )`,
      }}
    />

    {disableInteractionWithHighlight && <div
      style={{
        background: 'transparent',
        position: 'absolute',
        width,
        top: y,
        left: x,
        height
      }}
    />}
  </>;

}
