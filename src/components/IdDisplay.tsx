import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

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
const acceptIcon = css`
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
const resetIcon = css`
  ::after,::before{
    content: "";
    border-color: #e5e5e5;
    position: absolute;
    display: block;
    left:50%;
    top:50%;
    translate: -50% -50%;
  }
  ::after{
    width: 0;
    height: 0;
    background: #666;
    border-style: solid;
    border-width: 5px 7px 5px 0;
    border-color: transparent #e5e5e5 transparent transparent;
    transform: translate(-5px, -7px);
    box-shadow: -2px 3px 0 0 #666;
  }
  ::before{
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border-width: 3px;
    border-style: solid;
    background: unset;
  }
  `;
const AcceptButton = styled( IdActionButton )<{isAccept:boolean}>`

  ${( { isAccept } ) => ( isAccept
    ? acceptIcon
    : resetIcon )}
  
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
  const idContainerRef = useRef<HTMLInputElement>( null );
  useEffect(
    () => {

      idContainerRef.current?.focus();

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
            ref={idContainerRef}
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
            isAccept={userId.length >= 1}
            title={userId.length >= 1
              ? 'Accept new Id'
              : 'Use auto id'}
            onClick={() => {

              setId( userId );

            }}
          >
          </AcceptButton>
        </>
        : <>
          <IdButton
            ref={idContainerRef}
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
