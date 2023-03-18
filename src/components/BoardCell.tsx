import { DispatchWithoutAction } from 'react';
import styled from 'styled-components';
import { BOARD_SIZE, PLAYER_MOVEMENT } from '../constants';
import { useGameLogic } from '../hooks/useGameManager';
import { useLastKnownPosition } from '../hooks/useLastKnownPosition';

export const playerUnitId = 'player-unit';
export const lastKnownPositionClassName = 'last-known-marker';
export const craterClassName = 'shelled-area';
export const wreckClassName = 'enemy-wreck';

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
export const Player = styled.div.attrs( {
  title: 'Your unit',
  id: playerUnitId
} )<{position?:Vector2}>`
  width: 20px;
  height: 20px;
  margin: auto;
  background: ${( { theme } ) => theme.screen.text.color};
  border-radius: 50%;
  position: relative;
  filter: drop-shadow( 0 0 3px ${( { theme } ) => theme.screen.text.glowColor});
  ::before{
    content:"";
    display: block;
    position: absolute;
    height: 50%;
    width: 19%;
    top: 0%;
    left: 50%;
    translate: -50% 0;
    background: ${( { theme } ) => theme.screen.text.color};
    transform-origin: top center;
    transform: translateY(3px) translateX(6px) rotate(-134deg);  }
  ::after{
    content:"";
    display: block;
    position: absolute;
    height: 40%;
    width: 160%;
    bottom: -7%;
    left: 50%;
    border-radius: 7px;
    translate: -50% 0;
    background: ${( { theme } ) => theme.screen.backgroundColor};
    border: solid 2px ${( { theme } ) => theme.screen.text.color};
  }
  ${( { position } ) => {

    if ( !position ) {

      return 'unset';

    }
    const { x, y } = position;
    return `
    position: absolute;
    pointer-events: none;
    translate: 
      calc( ${25 + x * 50}px - 50% ) 
      calc( ${25 + y * 50}px - 50% );
    `;

  }}
`;
const Wreck = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 16px 20px 16px;
  border-color:  transparent transparent yellow transparent;
  position: absolute;
  bottom: 30%;
  left: 50%;
  margin: auto;
  transform-origin: bottom;
  animation: burning 1s alternate infinite;
  ::after{
    content:"";
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 3px 10px 10px;
    border-color:  transparent transparent yellow transparent;
    position: absolute;
    top: 5px;
    left:5px;
    animation: burning .5s alternate infinite;
    animation-delay: .5s;
    opacity: .9;
  }
  ::before{
    opacity: .9;
    content:"";
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 10px 10px 3px;
    border-color:  transparent transparent yellow transparent;
    position: absolute;
    top: 5px;
    right: -5px;
    animation: burning .3s alternate infinite;
    animation-delay: .4s;

  }
  @keyframes burning {
    from{
      transform: translateX(-50%) scaleY(1);
      filter: hue-rotate(0deg)
    }
    to{
      transform: translateX(-50%) scaleY(1.5);
      filter: hue-rotate(-40deg)
    }
  }
`;
const Crater = styled.div.attrs( { title: 'Shelled area' } )`
  width: 100%;
  height: 100%;
  margin: auto;
  /* background: black; */
  position: relative;
  /* border-radius: 50%; */
  overflow: hidden;
  ::after,::before{
    content:"";
    display: block;
    position: absolute;
    width: 4px;
    height: 150%;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    background: ${( { theme } ) => theme.screen.text.color};
  }
  ::before{
    transform: rotate(-45deg);
  }
  ::after{
    transform: rotate(45deg);
  }
`;
const LastKnownPosition = styled.div.attrs( { title: 'opponent\'s last known position' } )`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 25px 14px 0 14px;
  border-color: ${( { theme } ) => theme.screen.text.color} transparent transparent transparent;
  position: absolute;
  top: 25%;
  left: 50%;
  margin: auto;
  transform: rotateZ(360deg) translate(-50%);
  filter: drop-shadow( 0 0 3px ${( { theme } ) => theme.screen.text.glowColor});
  animation: blink .5s ;
  animation-iteration-count: infinite;
  @keyframes blink{
    from {
      opacity: 0.4;
    }
    to{
      
      opacity: 0.8;
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
  item:Item;
} ;

export function BoardCell ( {
  x,
  y,
  item,
  playerPosition,
  commandMode,
  selectSector,
  clearCursor,
  dispatch,
}: Props ) {

  const { awaitingPlayerInput, board } = useGameLogic();
  const lastKnown = useLastKnownPosition();
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

          return false;

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
  const isLastKnown = x === lastKnown?.x && y === lastKnown.y;
  const cratered = ( [ 'CRATER',
    'DESTROYED' ] as Item[] ).includes( item );

  return <BoardCellRoot
    {...getCSSIdentifiers()}
    onMouseEnter={handleCellInteraction}
    onFocus={handleCellInteraction}
    onClick={dispatch}
    disabled={!canSelect()}
    onMouseLeave={( { currentTarget } ) => {

      currentTarget.blur();

    }}
  >
    {item === 'PLAYER' && <Player />}
    {cratered && <Crater />}
    {item === 'DESTROYED' && <Wreck />}
    {isLastKnown && <LastKnownPosition/>}
  </BoardCellRoot>;
  function getCSSIdentifiers ():{id?:string, className:string} {

    const ids :ReturnType<typeof getCSSIdentifiers> = { className: '' };
    switch ( item ) {

      case 'PLAYER':
        ids.id = playerUnitId;
        break;
      case null:
        break;
      case 'DESTROYED':
        ids.className += wreckClassName;

      /* eslint-disable-next-line no-fallthrough */
      default:
        ids.className += ` ${craterClassName}`;

    }
    if ( isLastKnown ) {

      ids.className += ` ${lastKnownPositionClassName}`;

    }
    return ids;

  }

}
