import { Peer, DataConnection } from 'peerjs';
import {
  useCallback, useEffect, useRef, useState
} from 'react';


export function usePeer ( { onOpen }:{onOpen( id:string ):void, } ) {

  const peerRef = useRef<Peer>( new Peer() );
  const [ id, setId ] = useState<string>( );
  const [ connection, setConnection ] = useState<DataConnection|null>( null );
  const [ error, setError ] = useState<string>( );
  const handleConnectionClosed = useCallback(
    ( ) => {

      alert( 'your peer has left' );
      setConnection( null );

    },
    []
  );
  const handleConnection = useCallback(
    ( conn:DataConnection ) => {

      conn.on(
        'close',
        handleConnectionClosed
      );
      conn.addListener(
        'error',
        ( error ) => {

          console.error( error );
          setError( ( error as any ).type );

        }
      );
      if ( !connection ) {

        return setConnection( conn );

      }
      conn.close();

    },
    [ connection,
      handleConnectionClosed ]
  );
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
    handleConnection( conn );

  }

  return {
    id,
    connection,
    peer,
    connect
  };

}
