import { DispatchWithoutAction, useState } from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  --color: #a7a7a7;
  width: fit-content;
  border: outset 2px var(--color);
  border-radius: 50%;
  padding: 6px;
  background: var(--color);
  margin-top: 10px;
`;
const RoundButton = styled.button<{ active?: boolean; clicked?: boolean; }> `
  --color: ${({ active }) => (active
    ? '#f23333ff'
    : '#b7262644'
  )};
  --shadow-color: ${({ active }) => (active
    ? '#863b3b99'
    : '#35353599'
  )};
  background: var(--color);
  border: solid 10px #5f1515;
  background: #5e0202;
  border-radius: 50%;
  height: 80px;
  width: 80px;
  position: relative;
  transition:  all .2s;
  filter:${({ clicked }) => (clicked
    ? 'drop-shadow(var(--shadow-color) 0px 0px 2px)'
    : 'drop-shadow(var(--shadow-color) 7px 7px 2px)'
  )};
  transform:${({ clicked }) => (clicked
    ? 'scale(.95);'
    : 'scale(1);'
  )};
  ::after{
    content: "";
    display: block;
    position: relative;
    left: 50%;
    transform: translate(-50% ,0);
    border-radius: 50%;
    height: 35px;
    width: 35px;
    filter: blur(8px);
    background-color: var(--color);
    transition:  background-color .2s;
  }
`;
export function LightupButton({ canAct, onClick }: { onClick: DispatchWithoutAction; canAct: boolean; }) {

  const [clicked, setClicked] = useState(false);
  return <div
    style={{
      margin: '10px auto',
      width: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#eee'
    }}
  >

    COMMAND
    <ButtonContainer>
      <RoundButton
        onClick={onClick}
        onMouseDown={() => {

          setClicked(true);

          /*
           * setTimeout(
           *   () => setClicked( false ),
           *   300
           * );
           */
        }}
        onMouseUp={() => {

          setClicked(false);

        }}
        clicked={clicked}
        active={canAct}

        disabled={!canAct}
      >
      </RoundButton>
    </ButtonContainer>
  </div>;

}
