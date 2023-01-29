import { Peer, DataConnection } from 'peerjs';
import {
  useCallback,
  useEffect, useRef, useState
} from 'react';

const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 100;

export function usePeer ( { onOpen }:{onOpen( id:string ):void, } ) {

  const peerRef = useRef<Peer>( new Peer() );
  const connectionRef = useRef < DataConnection|null>( null );
  const [ id, setId ] = useState<string>( );
  const [ loading, setStatus ] = useState<ConnectionStatus>( 'DISCONNECTED' );
  const [ error, setError ] = useState<string>( );
  const handleConnection = useCallback(
    ( conn:DataConnection ) => {

      if ( connectionRef.current === null ) {

        // run on 0 timeout just so it runs after this function finishes
        setTimeout(
          () => {

            if ( !conn.open ) {

              handleConnectionClosed( 'Peer failed to connect' );

            }


          },
          0
        );
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
        setStatus( 'READY' );
        connectionRef.current = conn;
        return;

      }
      conn.close();

    },
    []
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
        'error',
        console.error
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

      };
      function handlePeerOpen ( peerId: string ): void {

        setId( peerId );
        onOpen( peerId );

      }

    },
    [ onOpen ]
  );

  const { current: peer } = peerRef;


  const connect = ( peerId:string ) => {

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

      setStatus( 'LOADING' );
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
            setStatus( 'DISCONNECTED' );
            conn.close();
            return clearInterval( interval );

          }
          tries++;

        },
        RETRY_INTERVAL_MS
      );

    }

  };
  const disconnect = ( ) => {

    const { current: connection } = connectionRef;
    if ( connection?.open ) {

      return connection?.close();

    }
    handleConnectionClosed();

  };
  const sendMessage = ( message:GameMessage ) => {

    if ( connectionRef.current === null ) {

      throw new Error( 'Tried to send a message on non-existnet connection' );

    }
    connectionRef.current.send( message );

  };
  const addDataConnectionEventListener = ( listener:GameEventListener ) => {

    const { current: connection } = connectionRef;
    if ( connection === null ) {

      throw new Error( 'Tried to add a listener to non-existnet connection' );

    }
    connection.on(
      'data',
      listener
    );
    return () => {

      connection.removeListener(
        'data',
        listener
      );

    };


  };
  return {
    id,
    error,
    loading,
    connect,
    disconnect,
    sendMessage,
    addDataConnectionEventListener
  };
  function handleConnectionClosed ( reason:string|undefined = 'Player left' ) {

    setError( reason );
    setStatus( 'DISCONNECTED' );
    connectionRef.current = null;

  }


}
