import { Dispatch, DispatchWithoutAction, SetStateAction } from 'react';
import styled from 'styled-components';

const ModeButton = styled.button<{selected?:boolean}>`
  --color: ${( { selected } ) => ( selected
    ? '#b72626'
    : '#222' )};
  color:var(--color);
  border: solid 2px var(--color);
  background: #777;
`;

type Props = {
  setCommandMode: Dispatch<SetStateAction<CommandMode>>;
  commandMode: CommandMode;
  loaded: boolean;
  dispatch:DispatchWithoutAction;
};

export function CommandPanel ( {
  commandMode,
  setCommandMode,
  loaded,
  dispatch
}: Props ) {

  const fireMode = loaded
    ? 'FIRE'
    : 'RELOAD';

  if ( commandMode === 'INITIAL' ) {

    return <div>
      please place your unit <br/>
      <ModeButton
        onClick={dispatch}
        selected={true}>
          ACCEPT
      </ModeButton>
    </div>;

  }
  return <div>

    <h2>
      Select you command
    </h2>
    <ModeButton
      selected={commandMode === 'MOVE'}
      onClick={() => setCommandMode( 'MOVE' )}
    >
      MOVE
    </ModeButton>
    <ModeButton
      selected={commandMode === fireMode}
      onClick={() => setCommandMode( fireMode )}
    >
      {fireMode}
    </ModeButton>
  </div>;

}
