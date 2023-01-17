import { useState } from 'react';


export function ConnectionPage ( { connect, id }:{id: string | undefined, connect: ( peerId: string ) => void} ) {

  const [ peerId, setId ] = useState( '' );

  return <div>
    Your id is {' '}
    <button
      disabled={!id}
      title="copy to clipboard"
      onClick={() => {

        navigator.clipboard.writeText( id as string );

      } }>
      {id}
    </button>. <br />
    send it to a friend or type in their id to connect. <br />
    <input
      value={peerId}
      onChange={( { target: { value } } ) => setId( value )} />

    <button
      disabled={!peerId}

      onClick={() => {

        connect( peerId );

      } }
    >
      CONNECT
    </button>
  </div>;

}

