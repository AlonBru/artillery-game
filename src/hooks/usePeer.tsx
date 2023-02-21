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
  const [ userSetId, setId ] = useState<string>( );
  const [ serverId, setServerId ] = useState<string>( );
  const [ connectionStatus, setConnectionStatus ] = useState<ConnectionStatus>( 'DISCONNECTED' );
  const [ error, setError ] = useState<string>( );

  const handleConnection = useCallback(
    ( conn:DataConnection ) => {

      if ( connectionRef.current === null ) {

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
        setConnectionStatus( 'READY' );
        connectionRef.current = conn;

        // check if the connection wasnt closed by the peer, sometimes happens without firing close event
        setTimeout(
          () => {

            if ( !conn.open ) {

              handleConnectionClosed( 'Peer failed to connect' );

            }


          },
          3000
        );
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

        if ( !userSetId ) {

          peerRef.current = new Peer();

        } else {

          peerRef.current = new Peer( userSetId );
          setServerId( undefined );

        }

      }
      return () => {

        if ( !peer.destroyed ) {

          peer.destroy();

        }

      };

    },
    /* eslint-disable-next-line function-paren-newline */
    [ userSetId ] );
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

        if ( !userSetId ) {

          setServerId( peerId );

        }
        onOpen( peerId );

      }

    },
    /* eslint-disable-next-line function-paren-newline */
    [ onOpen,
      userSetId ]
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

      setConnectionStatus( 'LOADING' );
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
            setConnectionStatus( 'DISCONNECTED' );
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
    function handleMessage ( data: unknown|GameMessage ) {

      if ( isGameMessage( data ) ) {

        listener( data );

      }

    }
    connection.on(
      'data',
      handleMessage
    );
    return () => {

      connection.removeListener(
        'data',
        handleMessage
      );

    };


  };
  return {
    id: userSetId || serverId,
    error,
    loading: connectionStatus,
    connect,
    disconnect,
    sendMessage,
    addDataConnectionEventListener,
    setId
  };
  function handleConnectionClosed ( reason:string|undefined = 'Player left' ) {

    setError( reason );
    setConnectionStatus( 'DISCONNECTED' );
    connectionRef.current = null;

  }


}
function isGameMessage ( data:unknown|GameMessage ):data is GameMessage {

  return ( data as GameMessage )?.gameMessage;

}
