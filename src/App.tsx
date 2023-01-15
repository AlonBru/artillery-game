import { useState } from 'react'
import styled from 'styled-components'

const BoardRoot = styled.main`
  margin: auto;
  width: 400px;
  height: 400px;
  display: grid;
  grid-template-columns: repeat(8,1fr);
  grid-column-gap: 2px;
  background: darkred;
`;
const BoardColumn = styled.div`
  display: grid;
  grid-template-rows: repeat(8,1fr);
  grid-row-gap: 2px;
  width: 100%;
  height: 100%;
`;

const BoardCell = styled.div`
  width: 100%;
  height: 100%;
  background: navy;
  :hover{
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

function App() {
  const [board, setBoard] = useState(new Array(8).fill(null).map(()=>new Array(8).fill(null)))
  return (
    <BoardRoot>
      {board.map((column,x)=>{
        return <BoardColumn key={x}>
        {column.map((item,y)=><BoardCell
          key={`${x}+${y}`}
          onClick={()=>{console.log(x,y)}}
        />)
        }
        </BoardColumn>
      })}
    </BoardRoot>
  )
}

export default App
