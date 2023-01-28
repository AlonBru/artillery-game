import { useEffect, useState } from 'react';
import styled from 'styled-components';

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

const IdSection = styled.section`
  display: grid;
  grid-template-areas: "id copy" "id link";
  grid-row-gap: 5px ;
  grid-column-gap: 10px ;
  margin-bottom: 10px;
`;
const IdContainer = styled.div`
  grid-area:id;
  font-family: monospace;
  border: 2px solid white;
  padding: 10px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const CopyButton = styled.button`
  position: relative;
  height: 30px;
  width: 30px;
  background: #ccc;
  cursor: pointer;
`;
const ClipboardButton = styled( CopyButton )`
  ::after,::before{
    content: "";
    border-radius: 3px;
    border: 2px solid #333;
    width: 8px;
    height: 11px;
    position: absolute;
    display: block;
  }
  ::after{
    left: 5px;
    bottom: 3px;
    background: inherit;
  }
  ::before{
    left: 9px;
    bottom: 6px;
  }
  
`;
const LinkButton = styled( CopyButton )`

  ::after,::before{
    content: "";
    border-radius: 5px;
    border: 2px solid #333;
    width: 6px;
    height: 12px;
    position: absolute;
    display: block;
    left:50%;
    top:50%;
    rotate: 50deg;
    translate: -50% -50%;
  }
  --x: 2px;
  --y: 3px;
  ::after{
    transform: translateY(var(--y)) translateX(var(--x));
  }
  ::before{
    transform: translateY(calc(0px - var(--y) )) translateX(calc(0px - var(--x) ));
  }
  
`;

export function ConnectionPage ( {
  connect,
  id,
  connected,
  loading,
  disconnectReason
}:{
  id: string | undefined, connect: ( peerId: string ) =>void;
  connected:boolean
  loading:boolean
  disconnectReason:string|undefined;
} ) {

  const [ peerId, setId ] = useState( () => {

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

        setId( '' );

      }

    },
    [ connected ]
  );
  const sameId = peerId === id;
  const disableButton = !peerId || connected || loading || sameId;
  function copyId () {

    navigator.clipboard.writeText( id as string );

  }
  return <Root connected={connected} >
    <GameTitle>
      [ Unnamed Artillery game ]
    </GameTitle>
    Your id is:
    <IdSection>
      <IdContainer
        onClick={copyId}
        title="copy id to clipboard"
      >
        {id || 'Loading...'}
      </IdContainer>
      <ClipboardButton
        title="copy id to clipboard"
        onClick={copyId}
      >

      </ClipboardButton>
      <LinkButton
        title="copy direct link for your peer"
        onClick={() => {

          const { origin, pathname } = document.location;
          const peerLink = `${origin}${pathname}?peer=${encodeURIComponent( id as string )}`;
          if ( import.meta.env.DEV ) {

            window.open(
              peerLink,
              '_blank',
            );

          }
          navigator.clipboard.writeText( peerLink );

        } }
      >

      </LinkButton>
    </IdSection>
    <br />
    Send it to a friend or type in their id to connect: <br />
    <div
      style={{
        display: 'flex'
      }}
    >
      <input
        disabled={loading}
        value={peerId}
        placeholder="Opponent's id"
        title={peerId}
        onChange={( { target: { value } } ) => setId( value )}
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
        {loading
          ? 'loading'
          : 'CONNECT ->' }
      </button>
    </div>
    {sameId && 'This is your own id, you cant connect to yourself!'}

    {!loading && disconnectReason && <span>
      Disconnected due to: {disconnectReason}
    </span>}
  </Root>;


  function attemptConnection () {

    connect( peerId );

  }

}

