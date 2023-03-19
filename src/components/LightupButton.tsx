import { ComponentPropsWithoutRef, useState } from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div<{hasLabel:boolean}>`
  --color: #a7a7a7;
  width: fit-content;
  border: outset 2px var(--color);
  border-radius: 50%;
  padding: 4%;
  background: var(--color);
  ${( { hasLabel } ) => hasLabel && 'margin-top: 10px;'}
`;
type ButtonProps = {
  active?: boolean;
  clicked?: boolean;
  size:number;
};

const RoundButton = styled.button<ButtonProps>`
  --color: ${( { active } ) => ( active
    ? '#f23333ff'
    : '#b7262644'
  )};
  --shadow-color: ${( { active } ) => ( active
    ? '#863b3b99'
    : '#35353599'
  )};
  border: solid ${( { size } ) => 0.125 * size}px #5f1515;
  background: #5e0202;
  border-radius: 50%;
  height: ${( { size } ) => `${size}px`};
  width: ${( { size } ) => `${size}px`};
  position: relative;
  font-family: monospace;
  color: white;
  font-weight: 600;
  transition:  all .2s;
  filter:${( { clicked, size } ) => ( clicked
    ? `drop-shadow(var(--shadow-color) 0px 0px ${( 2 / 80 ) * size})`
    // : `drop-shadow(var(--shadow-color) ${size * 7 / 80}px ${size * 7 / 80}px ${2/80*size})`
    : `drop-shadow(red ${size * 7 / 80}px ${size * 7 / 80}px ${( 2 / 80 ) * size})`
  )};
  transform:${( { clicked } ) => ( clicked
    ? 'scale(.95);'
    : 'scale(1);'
  )};
  ::after{
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50% ,-50%);
    border-radius: 50%;
    height: ${( { size } ) => `${0.4375 * size}px`};
    width: ${( { size } ) => `${0.4375 * size}px`};
    filter: blur(${( { size } ) => size * 0.1}px);
    background-color: var(--color);
    transition:  background-color .2s;
    z-index: -1;
  }
  :not(:disabled){
    cursor: pointer;
  }
`;
interface Props extends ComponentPropsWithoutRef<'button'> {
  onClick:React.MouseEventHandler;
  label?: string|JSX.Element;

  /** button diameter */
  size?:number;
  lighted?:boolean;
  disabled?: boolean;
}

export function LightupButton ( {
  onClick,
  label,
  children,
  size = 80,
  lighted,
  disabled,
  id,
  ...props
}: Props ) {

  const [ clicked, setClicked ] = useState( false );
  return <div
    id={id}
    style={{
      margin: '0 auto',
      padding: 10,
      width: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#eee'
    }}
  >

    {label}
    <ButtonContainer
      hasLabel={!!label}
    >
      <RoundButton
        size={size}
        onClick={onClick}
        onMouseDown={() => {

          setClicked( true );

        }}
        onMouseUp={() => {

          setClicked( false );

        }}
        clicked={clicked}
        active={lighted}
        disabled={disabled}
        {...props}
      >
        {children}
      </RoundButton>
    </ButtonContainer>
  </div>;

}
