import {
  Dispatch, DispatchWithoutAction, ReactNode, SetStateAction, useState
} from 'react';
import styled from 'styled-components';
import { useConnectionContext } from '../hooks/useConnection';
import { useGameLogic } from '../hooks/useGameManager';
import { CommandSelector } from './CommandSelector';


const BasePanel = styled.aside`
  display: grid;
  grid-template-rows: 1fr auto;
  background-color: #494949;
  border: 3px outset #555;
  padding: 13px;
  position: relative;
  @font-face {
    font-family: michroma;
    src: url(Michroma-Regular.ttf);
  }
  font-family: michroma;
  border-radius: 8px;
`;
const Screw = styled.div<{rotate:number}>`
  border-radius: 50%;
  height: 8px;
  width: 8px;
  position: absolute;
  background: #6b6033;
  overflow: hidden;
  border: #464646 inset 2px;
  ::after{
    content: "";
    height: 100%;
    width: 2px;
    background: #333;
    position: absolute;
    left: 50%;
    transform: translateX(-50%) rotate(${( { rotate } ) => rotate}deg);
  }

`;
const Main = styled.main`
`;

const CommunticationDisplay = styled.div`
  @font-face {
    font-family: greenScreen;
    src: url(Greenscr.ttf);
  }
  background: #003800;
  color: #3bc880;
  font-family: greenScreen;
  padding: 10px;
  border-radius: 10px;
  border: 5px inset #666;
  white-space: pre-wrap;
  text-transform: uppercase;
  text-shadow: #3bc880c7 0px 0 5px;
  font-weight: bold;
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

const CommandLine = styled.span`
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
  } = useGameLogic();


  if ( commandMode === 'INITIAL' ) {


    return <PanelBase>
      <CommunticationDisplay>
        Where should we deploy general? <br/>
        <CommandLine>
          {'> '}
        </CommandLine>
          Deploy to [{cursor?.x},{cursor?.y}]
      </CommunticationDisplay>
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
      STATUS:
      <ul>
        <li>
        Shell:{loaded
            ? 'READY'
            : 'SPENT'}
        </li>

      </ul>
      What is your command general?
      <br/>
      {'> '}
      <CommandLine>
        {requiresCoord

          ? `${commandMode} ${commandMode === 'MOVE'
            ? 'to'
            : 'on'} coordinate [${cursor?.x || '?'},${cursor?.y || '?'}]`
          : commandMode}
      </CommandLine>
    </CommunticationDisplay>
    <CommandSelector
      commandMode={commandMode}
      setCommandMode={setCommandMode}
    />

    <AcceptButton

      canAct={canAct}
      onClick={dispatch}
    />
  </PanelBase>;

}


function AcceptButton ( { canAct, onClick }:{onClick: DispatchWithoutAction, canAct: boolean} ) {

  const [ clicked, setClicked ] = useState( false );
  return <div
    style={{
      margin: 'auto',
      width: 'fit-content'
    }}
  >

    ACCEPT
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

