import styled from 'styled-components';

import { GameUI } from './GameUI';
import { GameLogicProvider } from '../hooks/useGameManager';
import { useSimulatedConnection } from '../hooks/useSimulatedConnection';
import { connectionContext } from '../hooks/useConnection';

import { useEffect, useLayoutEffect, useState } from 'react';
import {
  CommandModeChangeEvent, DeployCommandFiredEvent, useSubscribeToGameEvent
} from '../helpers/customEvents';
import { GameConditions, stages as gameTutorialStages, TutorialStage } from './tutorialStages';
import { stages as connectionStages } from './connectionTutorialStages';
import { CommandMessage, HitMessage, PositionMessage } from '../helpers/Message';
import { gameRootId } from './Game';

const darkOverlayZindex = 4;
const Root = styled.div`
  --overlay-color:#000000aa;
  position: relative;
  width: 100%;
  height: 100%;
  top:0;
  overflow: hidden;
`;
const TutorialContainer = styled.div`
  z-index: ${darkOverlayZindex - 1};
  position: relative;

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
  position: relative;
  width: calc(100% - 40px);
  min-height: 95px;
  top: 5px;
  left: 10px;
  background: white;
  color: black;
  padding:10px;
  border-radius: 5px;
  display: flex; 
  justify-content: space-between;
  align-items: center;
  white-space: pre-wrap;
  z-index: ${darkOverlayZindex + 1};
`;
const LeaveTutorialButton = styled.button`
  position: absolute;
  right: 5px ;
  top: 5px ;
  background: inherit;
  border:unset;
  color:black;
  font-family: monospace;
  font-size:20px;
  width: 20px;
  height: 20px;
  line-height: 10px;
  cursor: pointer;
  ::after{
    transition: .2s;
    content: 'leave tutorial';
    position: absolute;
    right: 20px;
    white-space: nowrap;
    font-size: 1rem;
    max-width: 0;
    text-align: right;
    overflow: hidden;
    border-bottom:2px solid red;
  }
  :hover::after, :focus::after{
    position: absolute;
    right:17px;
    max-width: 20ch;
    height: 12px;
    white-space: nowrap;
    font-size: 1rem;
  }
`;

const simulatedEnemySpawnLocation = {
  y: 0,
  x: 1
};
const simulatedEnemyHitLocation = {
  y: 0,
  x: 2
};
const stages = connectionStages.concat( gameTutorialStages );

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
  const isGameTutorial = currentStageIndex >= connectionStages.length;

  return <Root>
    {/* TUTORIAL
    <button onClick={exitTutorial}>tutorial</button> */}
    <TextContainer>
      <div>
        {text}
      </div>
      <LeaveTutorialButton
        onClick={exitTutorial}
      >
          X
      </LeaveTutorialButton>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {withNextButton && <button
          onClick={nextStage}
          disabled={disableNext}
          title={disableNext
            ? 'Please follow the instructions to continue'
            : undefined
          }
        >next</button>}

      </div>
      {currentStageIndex === stages.length - 1 && <button onClick={exitTutorial}>finish</button>}
    </TextContainer>
    {isGameTutorial && <TutorialContainer>
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
    </TutorialContainer>
    }

    <ElementHighlighter
      highlightedElementId={highlightedElementId}
      disableInteractionWithHighlight={disableInteractionWithHighlight}
    />

  </Root>;
  function handleMessageToFire ( type:GameMessage['type'] ) {

    let eventToFireOnNext :GameMessage|null = null;
    switch ( type ) {

      case 'position':
        eventToFireOnNext = new PositionMessage( simulatedEnemySpawnLocation );
        break;
      case 'hit':
        eventToFireOnNext = new HitMessage( simulatedEnemyHitLocation );
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

/**
 * Edges measured from top left
 */
type PositioningData = {
  leftEdge:number;
  topEdge:number;
  rightEdge:number;
  bottomEdge:number;
  width:number;
  height:number;
}

function ElementHighlighter ( {
  highlightedElementId,
  disableInteractionWithHighlight,
}:ElementHighlighterProps ) {

  const [ higlightedElementPosition, setHighlightedElementPosition ] = useState<PositioningData|null>( null );

  useLayoutEffect(
    () => {

      function highlight ( identifier:string ):()=>void {


        const elementToHighlight = document.getElementById( identifier ) ||
        document.getElementsByClassName( identifier )?.[0] as HTMLElement;
        const gameRoot = document.getElementById( gameRootId );
        if ( !elementToHighlight ) {

          throw new Error( `Element with id or class ${identifier} was not found` );


        }
        if ( !gameRoot ) {

          throw new Error( `Element with id ${gameRootId} was not found` );


        }
        const elementRect = elementToHighlight.getBoundingClientRect();
        const rootRect = gameRoot.getBoundingClientRect();
        const x = elementRect.x - rootRect.x;
        const y = elementRect.y - rootRect.y;
        const fromTop = y + elementRect.height;
        const fromLeft = x + elementRect.width;
        setHighlightedElementPosition( {
          rightEdge: fromLeft,
          bottomEdge: fromTop,
          leftEdge: x,
          topEdge: y,
          width: elementRect.width,
          height: elementRect.height
        } );
        return function cleanUp () {

          setHighlightedElementPosition( null );

        };

      }
      if ( highlightedElementId ) {

        return highlight( highlightedElementId );

      }

    },
    [ highlightedElementId ]
  );
  if ( !higlightedElementPosition ) {

    return <TutorialOverlayTotal/>;

  }
  const {
    leftEdge, topEdge, rightEdge, bottomEdge, width, height
  } = higlightedElementPosition;

  return <>

    <TutorialOverlay // top
      style={{
        bottom: `calc( 100% - ${topEdge}px  )`,
        right: `calc(100% - ${rightEdge}px`,
      }}
    />
    <TutorialOverlay // right
      style={{
        bottom: `calc( 100% - ${bottomEdge}px  )`,
        left: rightEdge,
      }}
    />
    <TutorialOverlay // bottom
      style={{
        top: bottomEdge,
        left: leftEdge,
      }}
    />
    <TutorialOverlay // left
      style={{
        top: topEdge,
        right: `calc( 100% - ${leftEdge}px  )`,
      }}
    />

    {disableInteractionWithHighlight && <TutorialOverlay
      style={{
        background: 'transparent',
        position: 'absolute',
        width,
        top: topEdge,
        left: leftEdge,
        height
      }}
    />}
  </>;

}
