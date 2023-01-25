import {
  Dispatch, DispatchWithoutAction, ReactNode, SetStateAction, useState
} from 'react';
import styled from 'styled-components';
import { useConnectionContext } from '../hooks/useConnection';
import { useGameLogic } from '../hooks/useGameManager';
import { CommandSelector } from './CommandSelector';
import { GreenScreenDisplay } from './styled';


const BasePanel = styled.aside`
  display: grid;
  grid-template-rows: 1fr auto;
  background-color: #494949;
  border: 3px outset #555;
  padding: 13px;
  position: relative;
  font-family: michroma;
  border-radius: 8px;
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

const CommunticationDisplay = styled( GreenScreenDisplay )`
  padding: 14px;
  height: 170px;
  max-width: 400px;
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
  height: 50px;
  padding: 10px;
`;

const ButtonContainer = styled.div`
  --color: #a7a7a7;
  width: fit-content;
  border: outset 2px var(--color);
  border-radius: 50%;
  padding: 6px;
  background: var(--color);
  margin-top: 10px;
`;
const RoundButton = styled.button<{active?:boolean, clicked?:boolean}>`
  --color: ${( { active } ) => ( active
    ? '#f23333ff'
    : '#b7262644'
  )};
  --shadow-color: ${( { active } ) => ( active
    ? '#863b3b99'
    : '#35353599'
  )};
  background: var(--color);
  border: solid 10px #5f1515;
  background: #5e0202;
  border-radius: 50%;
  height: 80px;
  width: 80px;
  position: relative;
  transition:  all .2s;
  filter:${( { clicked } ) => ( clicked
    ? 'drop-shadow(var(--shadow-color) 0px 0px 2px)'
    : 'drop-shadow(var(--shadow-color) 7px 7px 2px)'
  )};
  transform:${( { clicked } ) => ( clicked
    ? 'scale(.95);'
    : 'scale(1);'
  )};
  ::after{
    content: "";
    display: block;
    position: relative;
    left: 50%;
    transform: translate(-50% ,0);
    border-radius: 50%;
    height: 35px;
    width: 35px;
    filter: blur(8px);
    background-color: var(--color);
    transition:  background-color .2s;
  }
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

  return <BasePanel>
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
      {children}
    </Main>
    <Footer>

      <button
        onClick={() => {

          connection?.close();

        }}

      >
      leave game
      </button>
    </Footer>
  </BasePanel>;

}

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
      <CommunticationDisplay>
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
      </CommunticationDisplay>
      <CommandSelector
        commandMode={commandMode}
        setCommandMode={undefined}
        disabled={!awaitingPlayerInput }
      />
      <AcceptButton
        onClick={dispatch}
        canAct={awaitingPlayerInput && !!cursor}

      />
    </PanelBase>;

  }
  const requiresCoord = commandMode !== 'RELOAD';

  const commandInputValid = commandMode === 'RELOAD' || ( commandMode !== null && cursor !== null );
  const canAct =
  awaitingPlayerInput &&
  commandInputValid;

  return <PanelBase>
    <CommunticationDisplay>

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
    </CommunticationDisplay>
    <CommandSelector
      commandMode={commandMode}
      setCommandMode={setCommandMode}
      disabled={!awaitingPlayerInput }
    />
    <AcceptButton
      canAct={canAct}
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

function AcceptButton ( { canAct, onClick }:{onClick: DispatchWithoutAction, canAct: boolean} ) {

  const [ clicked, setClicked ] = useState( false );
  return <div
    style={{
      margin: '10px auto',
      width: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#eee'
    }}
  >

    COMMAND
    <ButtonContainer>
      <RoundButton
        onClick={onClick}
        onMouseDown={() => {

          setClicked( true );

          /*
           * setTimeout(
           *   () => setClicked( false ),
           *   300
           * );
           */

        }}
        onMouseUp={() => {

          setClicked( false );

        }}
        clicked={clicked}
        active={canAct}

        disabled={!canAct}
      >
      </RoundButton>
    </ButtonContainer>
  </div>;

}

