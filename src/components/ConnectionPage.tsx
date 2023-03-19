import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { IdDisplay } from './IdDisplay';

export const connectionInputContainerId = 'game-connect-input';

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
  & *:focus-visible{
    outline-color: #2ac000;
    outline-style: solid;
    outline-width: 4px;
  }
`;
const GameTitle = styled.h1`
  font-family:top-secret;
  color: #2ac000;
  `;
const ErrorMessage = styled.span`
  color: #c03000;
  font-weight: bold;
  transition: all .2s;
`;
const TutorialButton = styled.button`
  padding:5px;
  margin-top: 10px;
  font-weight: 600;
`;


type Props = {
  id: string | undefined;
  connect: ( peerId: string ) => void;
  connected: boolean;
  status: ConnectionStatus;
  disconnectReason: string | undefined;
  setId( newId: string ): void;
  peerError?: string;
  startTutorial():void;
};

export function ConnectionPage ( {
  connect,
  id,
  connected,
  status,
  disconnectReason,
  setId,
  peerError,
  startTutorial
}:Props ) {

  const [ peerId, setPeerId ] = useState( () => {

    const searchParams = new URLSearchParams( document.location.search );
    return searchParams.get( 'peer' ) || '';

  } );
  const peerErrorRef = useRef<HTMLSpanElement>( null );
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
  const [ isEditing, setEditing ] = useState<boolean>( false );

  const sameId = peerId === id;
  const isLoading = status !== 'DISCONNECTED';
  const disableButton = !peerId ||
    connected ||
    isLoading ||
    sameId ||
    isEditing ||
    !!peerError;

  return <Root connected={connected} >
    <GameTitle>
      [ Unnamed Artillery game ]
    </GameTitle>
    <IdDisplay
      id={id}
      setId={( newId ) => {

        setId( newId );
        setEditing( false );

      }}
      isEditing={isEditing}
      cancelEdit={() => setEditing( false )}
      enterEditMode={() => setEditing( true )}
    />
    {peerError && <ErrorMessage
      ref={peerErrorRef}
    >
      {peerError}
    </ErrorMessage>}
    <br />
    Send it to a friend or type in their id to connect: <br />
    <div
      id={connectionInputContainerId}
      style={{
        display: 'flex',
        gap: 5
      }}
    >
      <input
        disabled={isLoading || isEditing}
        value={peerId}
        placeholder="Opponent's id"
        title={isEditing
          ? 'Please finish editing your id'
          : ''}
        onChange={( { target: { value } } ) => setPeerId( value )}
        onKeyDown={( { key } ) => {

          if ( key === 'Enter' ) {

            attemptConnection();

          }

        }}
      />
      <button
        title={isEditing
          ? 'Please finish editing your id'
          : ''}
        disabled={disableButton}
        onMouseOver={() => {

          if ( peerError ) {

            peerErrorRef.current?.setAttribute(
              'style',
              'rotate: 2deg; filter:brightness(1.3);'
            );
            setTimeout(
              () => peerErrorRef.current?.setAttribute(
                'style',
                'rotate: -2deg; filter:brightness(1.3);'
              ),
              200

            );
            setTimeout(
              () => peerErrorRef.current?.setAttribute(
                'style',
                'rotate: 0deg;'
              ),
              300

            );

          }

        }}
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
    <TutorialButton onClick={startTutorial}>How to play</TutorialButton>

  </Root>;


  function attemptConnection () {

    connect( peerId );

  }

}


