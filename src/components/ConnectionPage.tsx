import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IdContainer, IdDisplay, IdSection } from './IdDisplay';

const Root = styled( 'div' )<{connected:boolean}>`
  --panel-width: 15px;
  font-family: 'Courier New', Courier, monospace;
  background: #222;
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

const GameTitle = styled.h1`
  font-family:top-secret;
  color: #2ac000;
`;

export function ConnectionPage ( {
  connect,
  id,
  connected,
  status,
  disconnectReason,
  setId
}:{
  id: string | undefined, connect: ( peerId: string ) =>void;
  connected:boolean
  status:ConnectionStatus;
  disconnectReason:string|undefined;
  setId( newId:string ):void;
} ) {

  const [ peerId, setPeerId ] = useState( () => {

    const searchParams = new URLSearchParams( document.location.search );
    return searchParams.get( 'peer' ) || '';

  } );

  // auto connect if peerId provided
  useEffect(
    () => {

      if ( peerId !== '' ) {

        attemptConnection();

      }

    },
    []
  );
  // clear id on connection
  useEffect(
    () => {

      if ( connected ) {

        setPeerId( '' );

      }

    },
    [ connected ]
  );
  const sameId = peerId === id;
  const isLoading = status !== 'DISCONNECTED';
  const disableButton = !peerId || connected || isLoading || sameId;

  return <Root connected={connected} >
    <GameTitle>
      [ Unnamed Artillery game ]
    </GameTitle>
    Your id is:
    {id
      ? <IdDisplay
        id={id}
        setId={setId}
      />
      : <IdSection>
        <IdContainer disabled value={'Loading...'}/>
      </IdSection>
    }
    <br />
    Send it to a friend or type in their id to connect: <br />
    <div
      style={{
        display: 'flex'
      }}
    >
      <input
        disabled={isLoading}
        value={peerId}
        placeholder="Opponent's id"
        title={peerId}
        onChange={( { target: { value } } ) => setPeerId( value )}
        onKeyDown={( { key } ) => {

          if ( key === 'Enter' ) {

            attemptConnection();

          }

        }}
      />
      <button
        disabled={disableButton}

        onClick={attemptConnection }
      >
        {isLoading
          ? 'loading'
          : 'CONNECT ->' }
      </button>
    </div>
    {sameId && 'This is your own id, you cant connect to yourself!'}

    {!isLoading && disconnectReason && <span>
      Disconnected due to: {disconnectReason}
    </span>}
  </Root>;


  function attemptConnection () {

    connect( peerId );

  }

}


