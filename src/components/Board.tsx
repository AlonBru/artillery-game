import { SetStateAction, Dispatch } from 'react';
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
const Player = styled.div`
  width: 66%;
  height: 66%;
  margin: auto;
  background: red;
  border-radius: 50%;
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
const Crater = styled.div`
  width: 66%;
  height: 66%;
  margin: auto;
  background: black;
  border-radius: 50%;
`;
const Marker = styled.div<{position:Vector2}>`
  margin: auto;
  text-align: center;
  border: ${( { theme } ) => theme.screen.text.color} 3px solid;
  font-family: serif;
  position: absolute;
  width: 20px;
  height: 20px;
  /* top:50%;
  left:50%; */
  pointer-events: none;
  /* transform: translate(${( { position: { x, y } } ) => `
  calc( ${25 + x * 50}px - 50% ),
  calc( ${25 + y * 50}px - 50% )
  `}); */
  translate:${( { position: { x, y } } ) => `
  calc( ${25 + x * 50}px - 50% ) calc( ${25 + y * 50}px - 50% )
  `};
  border-radius: 50%;
  transition: translate .2s;
  
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
  /* transform-origin: 50% 50%; */
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

const LastKnownPosition = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 10px 0 10px;
  border-color: #007bff transparent transparent transparent;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: auto;
  transform: rotateZ(360deg) translate(-50%);
`;
type BoardProps = {
  commandMode: CommandMode;
  cursor:Vector2|null;
  setCursor:Dispatch<SetStateAction<Vector2|null>>;
  board:Board;
  playerPosition:Vector2|null;
};

export function Board ( {
  commandMode,
  playerPosition,
  cursor,
  setCursor,
  board
}: BoardProps ) {

  const { lastKnown } = useGameLogic();
  return <Screen>
    <BoardRoot>
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
            onClick={() => {

              setCursor( {
                x,
                y
              } );

            }}>
            <>
              {item === 'PLAYER' && <Player />}
              {cratered && <Crater />}
              {item === 'DESTROYED' && <Wreck />}
              {isLastKnown && <LastKnownPosition/>}
            </>
          </BoardCell>;

        } )}
      </BoardColumn> )}

      { cursor !== null && <Marker position={cursor}/>}
    </BoardRoot>

    {/* {cursor !== null && <HLine y={cursor.y}/>}
    {cursor !== null && <VLine x={cursor.x}/>} */}
  </Screen>;

}
