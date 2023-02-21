import { useState } from 'react';
import styled from 'styled-components';

export const IdSection = styled.section`
  display: grid;
  grid-template-areas: "id copy" "id link";
  min-height: 65px;
  grid-row-gap: 5px ;
  grid-column-gap: 10px ;
  margin-bottom: 10px;
`;
export const IdContainer = styled.input`
  grid-area: id;
  font-family: monospace;
  border: 2px solid white;
  padding: 10px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: text;
`;

const IdActionButton = styled.button`
  position: relative;
  height: 30px;
  width: 30px;
  background: #ccc;
  cursor: pointer;
  color:black;
`;
const ClipboardButton = styled( IdActionButton )`
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
const LinkButton = styled( IdActionButton )`

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

export function IdDisplay ( { id, setId }: {
  id: string;
  setId( newId: string ): void;
} ) {

  const [ userId, setUserId ] = useState<string>( id );
  const [ isEditing, setEditing ] = useState<boolean>( false );
  function copyId () {

    navigator.clipboard.writeText( id as string );

  }
  return <IdSection
    onBlur={( { currentTarget } ) => {

      requestAnimationFrame( () => {

        // Check if the new focused element is a child of the original container
        if ( !currentTarget.contains( document.activeElement ) ) {

          setEditing( false );
          if ( isEditing ) {

            resetId();

          }

        }


      } );

    }}
  >
    <IdContainer
      title="Type your own id"
      value={userId}
      onChange={( { target: { value } } ) => setUserId( value )}
      onClick={() => setUserId( '' )}
      onFocus={() => {

        setEditing( true );

      }} />
    {isEditing
      ? <IdActionButton
        title="Cancel"
        onClick={() => {

          setEditing( false );
          resetId();

        }}
      >
        X
      </IdActionButton>
      : <ClipboardButton
        title="Copy id to clipboard"
        onClick={copyId}
      >

      </ClipboardButton>}
    {isEditing
      ? <IdActionButton
        title="Accept"
        onClick={() => {

          setEditing( false );
          setId( userId );

        }}
      >
        V
      </IdActionButton>
      : <LinkButton
        title="Copy direct link for your peer"
        onClick={() => {

          const { origin, pathname } = document.location;
          const peerLink = `${origin}${pathname}?peer=${encodeURIComponent( id as string )}`;
          if ( import.meta.env.DEV ) {

            window.open(
              peerLink,
              '_blank'
            );

          }
          navigator.clipboard.writeText( peerLink );

        }}
      >

      </LinkButton>}
  </IdSection>;


  function resetId () {

    setUserId( id );

  }

}
