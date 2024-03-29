import {
  Dispatch, DispatchWithoutAction, ReactNode, SetStateAction, useEffect, useState
} from 'react';
import styled from 'styled-components';
import { RematchMessage } from '../helpers/Message';
import { useConnectionContext } from '../hooks/useConnection';
import { useGameLogic } from '../hooks/useGameManager';
import { CommandSelector } from './CommandSelector';
import { InstructionsMaker } from './InstructionsMaker';
import { LightupButton } from './LightupButton';
import { Modal } from './Modal';
import { GreenScreenDisplay } from './styled';

export const commandPanelId = 'command-panel';
export const reloadButtonId = 'reload-button';


const BasePanel = styled.aside`
  display: grid;
  grid-template-rows: 1fr auto;
  background-color: #494949;
  border: 3px outset #555;
  padding: 13px;
  position: relative;
  font-family: michroma;
  border-radius: 8px;
  overflow:hidden;
`;
const Screw = styled.div<{rotate:number}>`
  border-radius: 50%;
  height: 8px;
  width: 8px;
  position: absolute;
  background: ${( { theme } ) => theme.screw.backgroundColor};
  overflow: hidden;
  border: ${( { theme } ) => theme.screw.borderColor} inset 2px;
  ::after{
    content: "";
    height: 100%;
    width: 2px;
    background: ${( { theme } ) => theme.screw.slitColor};
    position: absolute;
    left: 50%;
    transform: translateX(-50%) rotate(${( { rotate } ) => rotate}deg);
  }

`;
const Main = styled.main`
`;

const CommunicationDisplay = styled( GreenScreenDisplay )`
  padding: 14px;
  height: 170px;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;
const EndGameHeader = styled.p`
  font-size: 50px;
  height: 50px;
  text-align: center;
  margin:20px 0;
`;
const EndGameText = styled.div`
  font-size: 20px;
  text-align: center;
  
`;
const WaitingLine = styled.span`
  // for the ellipsis to cause a newline
  padding-inline-end: 30px;
  ::after{
    content: ".";
    animation-name: waiting;
    animation-duration: .5s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    position: absolute;
  }
  @keyframes waiting{
    
    30% {
      content:"..";
    }
    60% {
      content:"...";
    }
  }

`;


const Footer = styled.footer`
  height: 25px;
  padding-inline: 10px;
`;

const CommandLineCursor = styled.span`
  animation-name: cmd-blink;
  animation-duration: .8s ;
  animation-iteration-count: infinite;
  /* animation-timing-function:cubic-bezier(0,1,0.5,1); */
  animation-timing-function: steps(2,start);
  
  @keyframes cmd-blink {
    from{
      opacity: 0;
    }
    
    /* 50%{
      opacity: 1;

    } */
    to{
      opacity: 1;
    }
  }
`;

type Props = {
  setCommandMode: Dispatch<SetStateAction<CommandMode>>;
  commandMode: CommandMode;
  dispatch:DispatchWithoutAction;
  cursor:Vector2|null;
};

function PanelBase ( { children }:{children:ReactNode|ReactNode[]} ) {

  const connection = useConnectionContext();
  const { endGame } = useGameLogic();

  return <BasePanel id={commandPanelId}>
    <Screw
      rotate={55}
      style={{
        left: 3,
        top: 3,
      }}
    />
    <Screw
      rotate={55}
      style={{
        right: 3,
        top: 3,
      }}
    />
    <Screw
      rotate={55}
      style={{
        left: 3,
        bottom: 3,
      }}
    />
    <Screw
      rotate={55}
      style={{
        right: 3,
        bottom: 3,
      }}
    />
    <Main>
      <InstructionsMaker/>
      {children}
    </Main>
    <Footer>

      {endGame && <RematchButton/>}
      <button
        onClick={connection.disconnect}

      >
      leave game
      </button>
    </Footer>
  </BasePanel>;

}

export const communicationDisplayId = 'comm-display';

export function CommandPanel ( {
  commandMode,
  setCommandMode,
  dispatch,
  cursor
}: Props ) {

  const {
    loaded,
    awaitingPlayerInput,
    endGame
  } = useGameLogic();

  const coords = `[${cursor?.x || '?'},${cursor?.y || '?'}]`;
  if ( commandMode === 'INITIAL' ) {


    return <PanelBase>
      <CommunicationDisplay
        id={communicationDisplayId}
      >
        { awaitingPlayerInput && <>
          Where should we deploy general? <br/>
        </>}
        <CmdLine>
          Deploy to {coords}
        </CmdLine>
        <br/>
        <br/>
        {!awaitingPlayerInput &&
          <WaitingLine>
            awainting an update from the field
          </WaitingLine>}
      </CommunicationDisplay>
      <CommandSelector
        commandMode={commandMode}
        setCommandMode={undefined}
        disabled={!awaitingPlayerInput }
      />
      <LightupButton
        id={reloadButtonId}
        label={'COMMAND'}
        onClick={dispatch}
        lighted={false}
        disabled={true}

      />
    </PanelBase>;

  }
  const requiresCoord = commandMode !== 'RELOAD';

  const canAct =
  awaitingPlayerInput &&
  commandMode === 'RELOAD';

  return <PanelBase >
    <CommunicationDisplay
      id={communicationDisplayId}
    >

      {endGame
        ? <>
          <EndGameHeader>
            {endGame}
          </EndGameHeader>
          <EndGameText>
            {getEndgameText( endGame )}
          </EndGameText>
        </>
        : <>
      STATUS:
          <ul>
            <li>
        Shell:{loaded
                ? 'READY'
                : 'SPENT'}
            </li>

          </ul>
          {awaitingPlayerInput && <>
            What is your command general?
            <br/>
          </>}
          <CmdLine>
            {requiresCoord

              ? `${commandMode} ${commandMode === 'MOVE'
                ? 'to'
                : 'on'} coordinate ${coords}`
              : commandMode}
          </CmdLine>
          <br/>
          <br/>
          {!awaitingPlayerInput &&
          <WaitingLine>
            awainting an update from the field
          </WaitingLine>

          }
        </>
      }
    </CommunicationDisplay>
    <CommandSelector
      commandMode={commandMode}
      setCommandMode={setCommandMode as Dispatch<SetStateAction<SelectableCommandMode>>}
      disabled={!awaitingPlayerInput }
    />
    <LightupButton
      id={reloadButtonId}
      label={'COMMAND'}
      lighted={canAct}
      disabled={!canAct}
      onClick={dispatch}
    />
  </PanelBase>;
  function getEndgameText ( endType:EndGameStatus ):string {

    return endType === 'VICTORY'
      ? 'We have struck down the enemy'
      : 'our unit has been hit';

  }

}


function CmdLine ( { children }:{children:ReactNode|ReactNode[]} ) {

  return <span>
    <CommandLineCursor>
      {'> '}
    </CommandLineCursor>
    {children}
  </span>;

}

function RematchButton (): JSX.Element {

  const connection = useConnectionContext();
  const { resetGame } = useGameLogic();
  const [ requesting, setRequesting ] = useState( false );
  useEffect(
    () => connection.addDataConnectionEventListener( ( message ) => {

      if ( message.type === 'rematch' && message.data === 'accept' ) {

        setRequesting( false );
        resetGame();

      }

    } ),
    [ connection ]
  );
  return <button
    onClick={() => {

      setRequesting( true );
      connection.sendMessage( new RematchMessage( 'request' ) );

    } }

  >
    rematch?
    <Modal
      show={requesting}
    >
      requesting a rematch...
      <button
        onClick={connection.disconnect}
      >
      leave
      </button>
    </Modal>
  </button>;

}
