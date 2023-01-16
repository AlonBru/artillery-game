import { Peer, DataConnection } from 'peerjs';
import { useEffect, useRef, useState } from 'react';


export function usePeer ( { onOpen }:{onOpen( id:string ):void, } ) {

  const peerRef = useRef<Peer>( new Peer() );
  const [ id, setId ] = useState<string>( );
  const [ connection, setConnection ] = useState<DataConnection>();
  const [ connected, setConnected ] = useState( false );
  const [ error, setError ] = useState<string>( );
  const { current: peer } = peerRef;
  useEffect(
    () => {

      if ( !peer ) {

        peerRef.current = new Peer();

      }
      peer.on(
        'open',
        ( id ) => {

          setId( id );
          onOpen( id );

        }
      );
      peer.on(
        'connection',
        ( conn ) => {

          console.log( conn.metadata );
          setConnection( conn );

        }
      );
      return () => {

        if ( !peer.destroyed ) {

          peer.destroy();

        }

      };

    },
    []
  );

  function connect ( peerId:string ) {

    const conn = peer.connect(
      peerId,
      {
        metadata: { userName: 'danny' }
      }
    );
    setConnection( conn );
    conn.addListener(
      'open',
      () => setConnected( true )
    );
    conn.addListener(
      'error',
      ( error ) => setError( ( error as any ).type )
    );

  }

  return {
    id,
    connection,
    peer,
    connect,
    connected
  };

}
