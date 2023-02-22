import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const IdSection = styled.section`
  display: grid;
  grid-template-areas: "id copy" "id link";
  min-height: 65px;
  grid-row-gap: 5px ;
  grid-column-gap: 10px ;
  margin-bottom: 10px;
`;
const IdContainer = styled.input`
  grid-area: id;
  font-family: monospace;
  border: 2px solid white;
  padding: 10px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: text;
  min-width: 250px;
`;
const IdButton = styled( IdContainer ).attrs( { as: 'button' } )`
`;
const IdActionButton = styled.button`
  position: relative;
  height: 30px;
  width: 30px;
  background: #666;
  cursor: pointer;
  color:#e5e5e5;
  :disabled{
    filter: brightness(.7);
    cursor: auto;
  }
`;
const ClipboardButton = styled( IdActionButton )`
  ::after,::before{
    content: "";
    border-radius: 3px;
    border: 2px solid #e5e5e5;
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
    border: 2px solid #e5e5e5;
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
const CancelButton = styled( IdActionButton )`

  ::after,::before{
    content: "";
    background: #e5e5e5;
    width: 3px;
    height: 12px;
    position: absolute;
    display: block;
    left:50%;
    top:50%;
    translate: -50% -50%;
  }
  ::after{
    transform: rotate(45deg);
  }
  ::before{
    transform: rotate(-45deg);
  }
  
`;
const AcceptButton = styled( IdActionButton )`

  ::after,::before{
    content: "";
    background: #e5e5e5;
    width: 3px;
    height: 12px;
    position: absolute;
    display: block;
    left:50%;
    top:50%;
    translate: -50% -50%;
  }
  ::after{
    transform: rotate(45deg);
  }
  ::before{
    transform:translateX(-5px) translateY(1px) rotateZ(-45deg) scaleY(0.3);
  }
  
`;

type Props = {
  id?: string;
  setId( newId: string ): void;
  isEditing: boolean;
  cancelEdit(): void;
  enterEditMode(): void;
};

export function IdDisplay ( {
  id = '',
  setId,
  cancelEdit,
  enterEditMode,
  isEditing
}: Props ) {

  const [ userId, setUserId ] = useState<string>( id );
  function copyId () {

    navigator.clipboard.writeText( id as string );

  }
  const inputRef = useRef<HTMLInputElement>( null );
  useEffect(
    () => {

      if ( isEditing ) {

        inputRef.current?.focus();

      }

    },
    [ isEditing ]
  );
  return <>
    {isEditing
      ? 'Type in an id'
      : 'Your id is:'
    }
    <IdSection>
      {isEditing
        ? <>
          <IdContainer
            ref={inputRef}
            title="Type a different id"
            value={userId}
            disabled={!isEditing}

            onChange={( { target: { value } } ) => setUserId( value )}
            onClick={() => {

              setUserId( '' );
              enterEditMode();

            }}
          />
          <CancelButton
            title="Cancel"
            onClick={() => {

              cancelEdit( );
              resetId();

            }}
          >
          </CancelButton>
          <AcceptButton
            title="Accept"
            disabled={userId.length < 1}
            onClick={() => {

              setId( userId );

            }}
          >
          </AcceptButton>
        </>
        : <>
          <IdButton
            tabIndex={0}
            title="Type a different id"
            disabled={!id}
            onChange={( { target: { value } } ) => setUserId( value )}
            onClick={() => {

              setUserId( '' );
              enterEditMode();

            }}
          >
            {id || 'Loading...'}
          </IdButton>
          <ClipboardButton
            title="Copy id to clipboard"
            onClick={copyId}
          >

          </ClipboardButton>
          <LinkButton
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

          </LinkButton>
        </>}
    </IdSection>
  </>;


  function resetId () {

    setUserId( id );

  }

}
