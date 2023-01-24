import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Root = styled( 'div' )<{connected:boolean}>`
  --panel-width: 15px;
  background: #333;
  position: absolute;
  top: 0;
  z-index: 1;
  height: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform-origin: 0 -10px ;
  transform-style: preserve-3d;
  transform: rotateX(${( { connected } ) => ( connected
    ? 90
    : 0 )}deg)
    ;
  transition: transform 0.8s ease-in;

  ::before{
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    background: #333;
    transform-origin: top;
    transform: translateZ(calc(0px - var(--panel-width)));
  }
  ::after{
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: var(--panel-width);
    background: #222;
    top: 100%;
    transform-origin: top;
    transform: rotateX(-90deg);
  }
`;

export function ConnectionPage ( { connect, id, connected }:{
  id: string | undefined, connect: ( peerId: string ) =>void,
  connected:boolean
} ) {

  const [ peerId, setId ] = useState( '' );
  useEffect(
    () => {

      setId( '' );

    },
    [ connected ]
  );
  return <Root connected={connected} >
    <span>Your id is {' '}
      <button
        disabled={!id}
        title="copy to clipboard"
        onClick={() => {

          navigator.clipboard.writeText( id as string );

        } }>
        {id}
      </button>.
    </span>
    <br />

    send it to a friend or type in their id to connect: <br />
    <input
      value={peerId}
      onChange={( { target: { value } } ) => setId( value )} />

    <button
      disabled={!peerId || connected}

      onClick={() => {

        connect( peerId );

      } }
    >
      CONNECT
    </button>
  </Root>;

}

