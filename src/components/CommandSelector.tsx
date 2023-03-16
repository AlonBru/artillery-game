import { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameManager';

const SelectorRoot = styled.div`
  display:grid;
  margin: 10px 0;
  --angle: 55deg;
  overflow: hidden;
  grid-row-gap: 20px;
`;
const ModesContainer = styled.div`
  display: flex;
  position: relative;
  gap:10px;
  justify-content: center;
  background: inherit;
  isolation: isolate;
`;
const ModeItem = styled.span<{ selected?: boolean; index: number; }>`
  --color: ${( { selected } ) => ( selected
    ? '#b72626'
    : '#222' )};
  background: inherit;
  color:var(--color);
  border-bottom: solid 2px var(--color);
  text-align: center;
  font-size: .9rem;
  width: 70px;
  padding: 0px;
  line-height: calc( 1rem + 3px );
  position: relative;
  transition: color .2s;
  /* angled line */
  ::before{
    content: "";
    position: absolute;
    z-index: -1;
    left: 50%;
    bottom:-20px;
    display: block;
    width: 2px;
    height: 50px;
    background: var(--color);
    transform-origin: bottom;
    transform: rotate(calc( 125deg + ${( { index } ) => index} * var(--angle) ))
  }
  /* straight line */
  ::after{
    content: "";
    position: absolute;
    z-index: -1;
    display: block;
    left: 50%;
    bottom: -20px;
    width: 2px;
    height: 20px;
    background: var(--color);
    transform-origin: bottom;
  }
`;
const SelectorKnob = styled.button<{ mode: number; }>`
  margin :10px auto;
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: black;
  border: dotted #ababab 2px; 
  filter: drop-shadow(#222 7px 7px 2px);
  &:not(:disabled){
    cursor: pointer;

  }
  /* notch */
  ::after{
    content: "";
    position: absolute;
    display: block;
    border-radius: 50%;
    top:8px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: #eaeaea;
    transform-origin: 50% calc( 50% + 28px);
    transform: translateX(-50%) rotate(calc(
      ( var(--angle) - 5deg ) * ( ${( { mode } ) => mode} - 1)
    ));
    transition: transform .2s cubic-bezier(1,0,.01,.99) ;
    border: 1px inset #141313;

  }
  
`;

export const commandSelectorId = 'command-mode-selector';
export function CommandSelector ( { commandMode, setCommandMode, disabled }: {
  disabled?:boolean;
  commandMode: CommandMode;
  setCommandMode: Dispatch<SetStateAction<CommandMode>>|undefined;
} ) {

  const { loaded } = useGameLogic();
  const modes = [
    'MOVE',
    'FIRE',
    'RELOAD'
  ];
  const fireMode = loaded
    ? 'FIRE'
    : 'RELOAD';
  function setCommand () {

    setCommandMode?.( ( mode ) => ( mode === 'MOVE'
      ? fireMode
      : 'MOVE' ) );

  }
  return <SelectorRoot id={commandSelectorId}>
    <ModesContainer>
      {modes.map( ( mode, i ) => <ModeItem
        selected={commandMode === mode}
        key={mode}
        index={i}
      >
        {mode}
      </ModeItem> )}
    </ModesContainer>
    <SelectorKnob
      mode={modes.indexOf( commandMode )}
      onClick={setCommand}
      disabled={!setCommandMode || disabled}
    >

    </SelectorKnob>
  </SelectorRoot>;

}
