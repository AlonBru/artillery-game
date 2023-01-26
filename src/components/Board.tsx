import {
  SetStateAction, Dispatch, DispatchWithoutAction, ReactNode
} from 'react';
import styled from 'styled-components';
import { useGameLogic } from '../hooks/useGameManager';
import { BoardCell } from './BoardCell';
import { BoardColumn, GreenScreenDisplay } from './styled';

const Screen = styled( GreenScreenDisplay )`
  padding:30px;
  width: fit-content;
  height: auto;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto; 

`;

const BoardRoot = styled.main`
  margin: auto;
  width: 400px;
  height: 400px;
  display: grid;
  grid-template-columns: repeat(8,1fr);
  grid-column-gap: 2px;
  background: ${( { theme } ) => theme.screen.text.color};
  padding: 3px;
  box-shadow: ${( { theme } ) => theme.screen.text.glowColor} 0px 0 5px;
`;
const Player = styled.div.attrs( { title: 'Your unit' } )`
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
const Reticule = styled.div<{position:Vector2}>`
  margin: auto;
  text-align: center;
  border: ${( { theme } ) => theme.screen.text.color} 3px solid;
  font-family: serif;
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
  border-radius: 50%;
  transition: translate .2s;
  filter: drop-shadow(0 0 3px ${( { theme } ) => theme.screen.text.glowColor}); 
  translate:${( { position: { x, y } } ) => `
  calc( ${25 + x * 50}px - 50% ) calc( ${25 + y * 50}px - 50% )
  `};
  /* horizontal */
  ::before{
    content: "";
    display: block;
    position: relative;
    width: 180%;
    left: -40%;
    top: 50%;
    height: 3px;
    background: linear-gradient(to right, ${( { theme } ) => theme.screen.text.color} 33%,transparent  33%, transparent 66%, ${( { theme } ) => theme.screen.text.color} 66%);
    transform: translateY(-50%);
  }

  /* vertical */
  ::after{
    content: "";
    display: block;
    position: relative;
    height: 180%;
    left: 50%;
    top: -50%;
    width: 3px;
    background:
    linear-gradient(${( { theme } ) => theme.screen.text.color} 33%,transparent  33%, transparent 66%, ${( { theme } ) => theme.screen.text.color} 66%);
    transform: translateX(-50%);
  }
  animation: target-animate 1s  alternate infinite ease-in-out;
  @keyframes target-animate {
    from{
      transform: scale(1) ;
      opacity: 1;
    }
    to{
      transform: scale(.9) ;
      opacity: .8;
    }
  } 
`;
const Arrow = styled.div<{from:Vector2, position:Vector2}>`
  background: ${( { theme } ) => theme.screen.text.color};
  position: absolute;
  width: 3px;
  height: 22px;
  pointer-events: none;
  transition: translate .2s;
  transform-origin: bottom center;
  filter: drop-shadow(0 0 3px ${( { theme } ) => theme.screen.text.glowColor}); 
  rotate: ${( { position, from } ) => getAngle(
    from,
    position
  )}deg;
  translate:${( { position: { x, y } } ) => `
    calc( ${25 + x * 50}px - 2px - 50% ) 
    calc( ${25 + y * 50}px - 2px - 100% )
  `};
  scale: 1 ${( { position: to, from } ) => {

    const { x: toX, y: toY } = to;
    const { x, y } = from;
    const dx = x - toX;
    const dy = y - toY;
    return dx * dy === 0
      ? 1
      : 1.2;

  }};

  /* arrow head */
  ::before{
    content: "";
    display: block;
    position: relative;
    width: 0;
    left: 50%;
    top: 100%;
    height: 3px;
    border-style: solid;
    border-width: 10px 7px 0 7px;
    border-color: ${( { theme } ) => theme.screen.text.color} transparent transparent transparent;
    transform: translateX(-50%);
  }

  animation: arrow-animate .5s  alternate infinite ease-in-out;
  @keyframes arrow-animate {
    from{
      transform: translateY(-15px) ;
      opacity: 1;
    }
    to{
      transform: translateY(-10px) ;
      opacity: .8;
    }
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
type BoardProps = {
  commandMode: CommandMode;
  cursor:Vector2|null;
  setCursor:Dispatch<SetStateAction<Vector2|null>>;
  board:Board;
  playerPosition:Vector2|null;
  dispatch:DispatchWithoutAction;
};

const markerMapper: {
  [key in CommandMode]:( props:PropsType<typeof Arrow> )=>JSX.Element|null
} = {
  MOVE: Arrow,
  FIRE: Reticule,
  RELOAD: () => null,
  INITIAL: Reticule

};

export function Board ( {
  commandMode,
  playerPosition,
  cursor,
  setCursor,
  board,
  dispatch,
}: BoardProps ) {

  const { lastKnown, awaitingPlayerInput } = useGameLogic();
  function clearCursor () {

    if ( !awaitingPlayerInput ) {

      // if command was dispatched already, do not clear cursor
      return;

    }
    setCursor( null );

  }
  const Marker = markerMapper[commandMode];
  return <Screen>
    <BoardRoot
      onBlur={( { currentTarget } ) => {

        // Give browser time to focus the next element
        requestAnimationFrame( () => {

          // Check if the new focused element is a child of the original container
          if ( !currentTarget.contains( document.activeElement ) ) {

            clearCursor();

          }

        } );

      }}
      onMouseLeave={clearCursor}
    >
      {board.map( ( column, x ) => <BoardColumn key={x}>
        {column.map( ( item, y ) => {

          const isLastKnown = x === lastKnown?.x && y === lastKnown.y;
          const cratered = ( [ 'CRATER',
            'DESTROYED' ] as Item[] ).includes( item );
          return <BoardCell
            commandMode={commandMode}
            playerPosition={playerPosition}
            x={x}
            y={y}
            key={`${x}+${y}`}
            selectSector={() => {

              setCursor( { x,
                y } );

            }}
            clearCursor={clearCursor}
            dispatch={dispatch}
          >
            <>
              {item === 'PLAYER' && <Player />}
              {cratered && <Crater />}
              {item === 'DESTROYED' && <Wreck />}
              {isLastKnown && <LastKnownPosition/>}
            </>
          </BoardCell>;

        } )}
      </BoardColumn> )}

      { cursor !== null && <Marker
        position={cursor}
        from={playerPosition as Vector2}
      />}
    </BoardRoot>

  </Screen>;

}

function getAngle ( from:Vector2, to:Vector2 ):number {

  const { x: fromX, y: fromY } = from;
  const { x, y } = to;
  const dx = x - fromX;
  const dy = y - fromY;

  const angle = ( 180 / Math.PI ) * Math.atan2(
    dy,
    dx
  ) - 90;
  return angle;

}
