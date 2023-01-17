import { Peer, DataConnection } from 'peerjs';
import { useEffect, useRef, useState } from 'react';


export function usePeer ( { onOpen }:{onOpen( id:string ):void, } ) {

  const peerRef = useRef<Peer>( new Peer() );
  const [ id, setId ] = useState<string>( );
  const [ connection, setConnection ] = useState<DataConnection|null>( null );
  const [ error, setError ] = useState<string>( );
  useEffect(
    () => {

      const { current: peer } = peerRef;
      if ( !peer || peer.destroyed ) {

        peerRef.current = new Peer();

      }
      return () => {

        if ( !peer.destroyed ) {

          peer.destroy();

        }

      };

    },
    []
  );
  useEffect(
    () => {

      const { current: peer } = peerRef;
      peer.on(
        'open',
        handlePeerOpen
      );
      peer.on(
        'connection',
        handleConnection
      );
      connection?.on(
        'close',
        handleConnectionClosed
      );
      return () => {

        peer.removeListener(
          'open',
          handlePeerOpen
        );
        peer.removeListener(
          'connection',
          handleConnection
        );
        connection?.removeListener(
          'close',
          handleConnectionClosed
        );

      };
      function handlePeerOpen ( peerId: string ): void {

        setId( peerId );
        onOpen( peerId );

      }
      function handleConnection ( conn:DataConnection ) {

        if ( !connection ) {

          return setConnection( conn );

        }
        conn.close();

      }
      function handleConnectionClosed ( ) {

        setConnection( null );

      }

    },
    [ connection,
      onOpen ]
  );

  const { current: peer } = peerRef;

  function connect ( peerId:string ) {

    const conn = peer.connect(
      peerId,
      {
        metadata: { userName: 'danny' }
      }
    );
    setConnection( conn );
    conn.addListener(
      'error',
      ( error ) => setError( ( error as any ).type )
    );

  }
  return {
    id,
    connection,
    peer,
    connect
  };

}
