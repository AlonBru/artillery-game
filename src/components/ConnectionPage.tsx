import { ComponentPropsWithoutRef, useState } from 'react';
import { usePeer } from '../hooks/usePeer';
import { connectionContext } from '../hooks/useConnection';


export function ConnectionPage ( { children }: Pick<ComponentPropsWithoutRef<'div'>, 'children'> ) {

  const [ peerId, setId ] = useState( '' );
  const {
    connection,
    id,
    connect
  } = usePeer( { onOpen: console.log } );
  if ( !connection ) {

    return <div>
    Your id is {' '}
      <button
        disabled={!id}
        title="copy to clipboard"
        onClick={() => {

          navigator.clipboard.writeText( id as string );

        }}>
        {id}
      </button>. <br/>
      send it to a friend or type in their id to connect. <br/>
      <input
        value={peerId}
        onChange={( { target: { value } } ) => setId( value )}
      />
      <button onClick={() => {

        connect( peerId );

      }}>
        CONNECT
      </button>
    </div>;

  }

  return <connectionContext.Provider value={connection} >
    {children}
  </connectionContext.Provider>;

}
