import { Dispatch, DispatchWithoutAction, SetStateAction } from 'react';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameManager';

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
  dispatch:DispatchWithoutAction;
  cursor:Vector2|null;
};

export function CommandPanel ( {
  commandMode,
  setCommandMode,
  dispatch,
  cursor
}: Props ) {

  const { loaded, awaitingPlayerInput } = useGameLogic();
  const fireMode = loaded
    ? 'FIRE'
    : 'RELOAD';


  if ( commandMode === 'INITIAL' ) {

    return <div>
      please select position to place your unit <br/>
      <ModeButton
        onClick={dispatch}
        selected={!!cursor}
        disabled={!awaitingPlayerInput || !cursor}
      >
          ACCEPT
      </ModeButton>
    </div>;

  }
  const commandInputValid = commandMode === 'RELOAD' || ( commandMode !== null && cursor !== null );
  const canAct =
  awaitingPlayerInput &&
  commandInputValid;

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
    <br/>
    <br/>
    <ModeButton
      onClick={dispatch}
      selected={canAct}
      disabled={!canAct}
    >
          ACCEPT
    </ModeButton>
  </div>;

}
