import { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';
import { BOARD_SIZE, PLAYER_MOVEMENT } from '../constants';
import { BoardColumn } from './styled';

const BoardCellRoot = styled.button`
  all: unset;
  display: block;
  width: 100%;
  height: 100%;
  background: navy;
  position: relative;
  :not(:disabled):hover{
    outline: yellow solid 1px;
  }
  :nth-child(2n){
    background-color: skyblue;
  }
  ${BoardColumn}:nth-child(2n) & {
    background: skyblue;
    :nth-child(2n){
      background: navy;
    }

  }
  
  
`;
export function BoardCell ( {
  x, y, children, playerPosition, commandMode, onClick
}: {
  x: Vector2['x'];
  y: Vector2['y'];
  playerPosition: Vector2 | null;
  commandMode: CommandMode;
} & Pick<ComponentPropsWithoutRef<'button'>, 'children' | 'onClick'> ) {

  function canSelect (): boolean {

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
  return <BoardCellRoot
    disabled={!canSelect()}
    onClick={onClick}
  >
    {children}
  </BoardCellRoot>;

}
