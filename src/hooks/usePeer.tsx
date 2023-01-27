import { Peer, DataConnection } from 'peerjs';
import {
  useCallback, useEffect, useRef, useState
} from 'react';

const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 100;

export function usePeer ( { onOpen }:{onOpen( id:string ):void, } ) {

  const peerRef = useRef<Peer>( new Peer() );
  const [ id, setId ] = useState<string>( );
  const [ connection, setConnection ] = useState<DataConnection|null>( null );
  const [ loading, setLoading ] = useState<boolean>( false );
  const [ error, setError ] = useState<string>( );
  const handleConnectionClosed = useCallback(
    ( ) => {

      setError( 'Player left' );
      setLoading( false );
      setConnection( null );

    },
    []
  );
  const handleConnection = useCallback(
    ( conn:DataConnection ) => {

      if ( !connection ) {

        conn.on(
          'close',
          handleConnectionClosed
        );

        conn.on(
          'error',
          ( error ) => {

            console.error( error );
            setError( ( error as any ).type );

          }
        );
        setError( undefined );
        return setConnection( conn );

      }
      conn.close();
      setLoading( false );

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

    setError( undefined );
    if ( peer.open ) {

      return makeConnection();

    }
    peer.once(
      'open',
      makeConnection
    );
    function makeConnection () {

      const conn = peer.connect(
        peerId,
        {
          metadata: { userName: 'danny' }
        }
      );

      setLoading( true );
      conn.on(
        'error',
        ( err ) => console.error( err )
      );

      let tries = 0;
      const interval = setInterval(
        () => {

          if ( conn.open ) {

            handleConnection( conn );
            return clearInterval( interval );

          }

          if ( tries === MAX_RETRIES ) {

            setError( 'Peer does not exist or already in a game' );
            setLoading( false );
            return clearInterval( interval );

          }
          tries++;

        },
        RETRY_INTERVAL_MS
      );

    }

  }

  return {
    id,
    error,
    connection,
    peer,
    loading,
    connect
  };

}
