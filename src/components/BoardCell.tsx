import { ComponentPropsWithoutRef, DispatchWithoutAction } from 'react';
import styled from 'styled-components';
import { BOARD_SIZE, PLAYER_MOVEMENT } from '../constants';
import { useGameLogic } from '../hooks/useGameManager';

const BoardCellRoot = styled.button`
  all: unset;
  display: block;
  width: 100%;
  height: 100%;
  background: ${( { theme } ) => theme.screen.backgroundColor};
  position: relative;
  box-shadow: ${( { theme } ) => theme.screen.glowColor} 0px 0 5px inset;
  
  :not(:disabled){
    box-shadow: ${( { theme } ) => theme.screen.text.color} 0px 0 15px inset;
    :hover{
      box-shadow: ${( { theme } ) => theme.screen.text.color} 0px 0 10px inset;

    }
  }
  
`;
type Props = {
  x: Vector2['x'];
  y: Vector2['y'];
  playerPosition: Vector2 | null;
  commandMode: CommandMode;
  selectSector(): void;
  clearCursor(): void;
  dispatch:DispatchWithoutAction;
} & Pick<ComponentPropsWithoutRef<'button'>, 'children'>;

export function BoardCell ( {
  x,
  y,
  children,
  playerPosition,
  commandMode,
  selectSector,
  clearCursor,
  dispatch,
}: Props ) {

  const { awaitingPlayerInput, board } = useGameLogic();

  function canSelect (): boolean {

    if ( !awaitingPlayerInput ) {

      return false;

    }
    switch ( commandMode ) {

      case 'INITIAL': {

        if ( y === BOARD_SIZE - 1 ) {

          return true;

        }
        return false;

      }
      case 'MOVE': {

        if ( !playerPosition ) {

          throw new Error( 'tried to move without placing your piece' );

        }
        if ( board[x][y] === 'CRATER' ) {

          return false;

        }
        if ( playerPosition.x === x &&
          playerPosition.y === y
        ) {

          return false;

        }
        const dx = Math.abs( playerPosition.x - x );
        const dy = Math.abs( playerPosition.y - y );
        const targetInRange = dx <= PLAYER_MOVEMENT && dy <= PLAYER_MOVEMENT;
        return targetInRange;

      }
      case 'FIRE':

        if ( !playerPosition ) {

          throw new Error( 'tried to fire without placing your piece' );

        }
        // don't allow to shoot at your self
        return !( x === playerPosition.x && y === playerPosition.y );

      default:
        return false;

    }

  }
  function handleCellInteraction () {

    if ( canSelect() ) {

      return selectSector();

    }
    clearCursor();

  }
  return <BoardCellRoot
    onMouseEnter={handleCellInteraction}
    onFocus={handleCellInteraction}
    onClick={dispatch}
    disabled={!canSelect()}
    onMouseLeave={( { currentTarget } ) => {

      currentTarget.blur();

    }}
  >
    {children}
  </BoardCellRoot>;

}
