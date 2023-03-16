import {
  Dispatch, SetStateAction, useEffect, useState
} from 'react';
import styled from 'styled-components';
import { battleGridId } from './Board';
import { commandPanelId } from './CommandPanel';
import { LightupButton } from './LightupButton';

export const instructionsPanelId = 'instructions-panel';

const Root = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: 5px;
  align-items: center;
  margin-bottom: 10px;
  --paper-color: #ffffc5;
`;

const InstructionPrinter = styled.section<{show:boolean|undefined}>`
  position: relative;
  background:red;
  border: 10px solid #6e6e6e;
  height: 4px;
  background: #333;
  border-radius:30px;
  // ripped edge in printer
  ::after{
    content:${( { show } ) => ( show === undefined
    ? ''
    : '""' )};
    display: block;
    position: absolute;
    top:100%;
    height:24px;
    width:calc(100% - 8px);
    left:4px;
    filter: drop-shadow(10px 12px 2px #2e2d2d47);
    background-image: 
      linear-gradient(-135deg,var(--paper-color) 25%,transparent 25%)
      ,linear-gradient(135deg,var(--paper-color) 25%,transparent 25%)
    ;
    background-size: 3% 49px;
    background-position-x: -6px;
    background-repeat: repeat-x;
    animation-name: appear;
    animation-iteration-count: 1;
    animation-duration: 1s;

    @keyframes appear{
      from{
        background-position-y: -10px ;
      }
      to{
        background-position-y: -0px ;
      }
     }
  }
`;
const Page = styled.div<{show?:boolean}>`
  position: relative;
  cursor:pointer;
  margin-top: -20px;
  overflow: hidden;
  z-index: 1;
  top:25px;
  left:4px;
  width: calc(100% - 8px);  
  padding-block: 10px;
  margin-top: -22px;
  filter: drop-shadow(10px 12px 2px #2e2d2d47);
  transform-origin: top right;
  /* used so the tear marks on the bottom will show (content will snap to bottom) */
  display: flex;
  flex-direction: column;
  justify-content: end;

  animation-timing-function: ease-in;
  transition: rotate .1s, translate .1s;
  :hover,:focus{
    rotate: -1.5deg;
    translate: 0 2px;
  }
  transform: translateX(${( { show } ) => ( show
    ? '0px'
    : 'calc( 100% + 100px)'
  )});
  animation-duration: ${( { show } ) => {

    switch ( show ) {

      case true:
        return '1.2s';
      case false:
        return '1s';
      default:
        return 'unset';

    }

  }} ;
  animation-name: ${( { show } ) => {

    switch ( show ) {

      case true:
        return 'print';
      case false:
        return 'tear';
      default:
        return 'unset';

    }

  }};
  ::before,::after{
    content:"";
    display: block;
    position: absolute;
    height:24px;
    width:100%;
    left:0;
    background-repeat: repeat-x;
  }
  ::before{
    top: -5px;
    background-image: 
      linear-gradient(-45deg,var(--paper-color) 25%,transparent 25%),
      linear-gradient(45deg,var(--paper-color) 25%,transparent 25%)
    ;
    background-size: 3% 15px;
  }
  ::after{
    z-index:1;
    bottom: -5px;
    background-image: 
      linear-gradient(135deg,var(--paper-color) 25%,transparent 25%),
      linear-gradient(-135deg,var(--paper-color) 25%,transparent 25%)
    ;
    background-size: 3% 54px;
    background-position-x: -5px;
  }

  @keyframes print{
    0%{
      max-height: 0px;
    }
    10%{     
      max-height: 20px;
    }
    20%{
      max-height: 20px;
    }
    to{
      max-height: 600px;
    }
  }
  @keyframes tear{
    0% {
      transform:translateX(0px) translateY(10px);
    }
    30%{
      transform:translateX(-15px) translateY(20px) rotate(-25deg);
    }
    100%{
      transform:translateX(calc( 100% + 100px)) translateY(10px) rotate(-110deg);
    }
  }

`;
const PageContent = styled.article`
  background: var(--paper-color);
  padding:20px;
  min-width: 200px;
  font-size: 1.1em;
  color: black;
  white-space: pre-wrap;
  font-family: atwriter;
  position: relative;
  *::first-letter{
    text-transform: capitalize;
  }
  
`;

const rules = [
  'select deploy sector to begin',
  'on each turn you can move or fire/reload',
  'firing will create an impassable crater on the hit sector',
  'when you fire but don\'t hit, the enemy position will be revealed',
];

export function InstructionsMaker () {

  const [ showPaper, setShow ] = useState<boolean>( );
  return <Root id={instructionsPanelId}>
    <InstructionPrinter
      show={showPaper}
    >
      <Page
        title="tear away"
        show={showPaper}
        tabIndex={showPaper
          ? 0
          : undefined}
        onClick={( { currentTarget } ) => {

          setShow( false );
          currentTarget.blur();

        }}
        onKeyDown={( { key, currentTarget } ) => {

          if ( [ 'Enter',
            'Space' ].includes( key ) ) {

            setShow( false );
            currentTarget.blur();

          }

        }}
      >
        <PageContent>

          <h3 style={{
            textDecoration: 'underline 2px black',
          }}>
          objective: eliminate the enemy
          </h3>
          <h4>
            issue commands using the <u
              onMouseOver={() => {

                document.getElementById( battleGridId )?.setAttribute(
                  'style',
                  'border-color:red;'
                );

              }}
              onMouseOut={() => {

                document.getElementById( battleGridId )?.setAttribute(
                  'style',
                  ''
                );

              }}
            >
              Battle Grid
            </u> and the <u
              onMouseOver={() => {

                document.getElementById( commandPanelId )?.setAttribute(
                  'style',
                  'border-color:red;'
                );

              }}
              onMouseOut={() => {

                document.getElementById( commandPanelId )?.setAttribute(
                  'style',
                  ''
                );

              }}
            >
              Control Panel
            </u>
          </h4>
          <h4>
          instructions:
          </h4>
          <ul>
            {rules.map( ( rule, i ) => <li key={i}>{rule}.</li> )}
          </ul>
          <span>Good luck commander.</span>
        </PageContent>

      </Page>
    </InstructionPrinter>
    <IndsructionsButton
      setShow={setShow}
      showPaper={showPaper}
    />
  </Root>;


}
function IndsructionsButton ( { setShow, showPaper }:{
  setShow:Dispatch<SetStateAction<boolean|undefined>>,
  showPaper: boolean | undefined
} ) {

  const [ firstTime, setFirstTime ] = useState<boolean>( true );
  const [ lighted, setLighted ] = useState<boolean>( true );

  // show a blinking light if the instructions were never opened
  useEffect(
    () => {

      if ( firstTime ) {

        const interval = setInterval(
          () => {

            setLighted( true );
            setTimeout(
              () => {

                setLighted( false );

              },
              400
            );

          },
          600
        );
        return () => {

          setLighted( false );
          clearInterval( interval );

        };

      }

    },
    [ firstTime ]
  );

  return <LightupButton
    onClick={() => {

      setShow( true );
      if ( firstTime ) {

        setFirstTime( false );

      }

    } }
    title="get instructions"
    disabled={showPaper}
    size={30}
    lighted={firstTime
      ? lighted
      : !showPaper
    }
  >
    i
  </LightupButton>;

}

