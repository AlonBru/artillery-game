import { Peer, DataConnection } from 'peerjs';
import {
  useCallback,
  useEffect, useRef, useState
} from 'react';
import { BOARD_SIZE } from '../constants';

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
    function handleMessage ( message: unknown|GameMessage ) {

      if ( !isGameMessage( message ) ) {

        return;

      }
      if ( message.type !== 'rematch' ) {

        if ( isHitMessage( message ) || isPositionMessage( message ) ) {

          message.data = transformPeerPositionVector( message.data );

        }
        if ( isCommandMessage( message ) && message.data ) {

          message.data.target = transformPeerPositionVector( message.data.target );

        }

      }
      listener( message );


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
function isGameMessage ( data:unknown|GameMessage ):data is GameMessage {

  return ( data as GameMessage )?.gameMessage;

}
function isHitMessage ( data:GameMessage ):data is IHitMessage {

  return data.type === 'hit';

}
function isPositionMessage ( data:GameMessage ):data is IPositionMessage {

  return data.type === 'position';

}
function isCommandMessage ( data:GameMessage ):data is ICommandMessage {

  return data.type === 'command';

}

/** Treat positions sent by peer as if they are looking at the board from the opposite side */
function transformPeerPositionVector ( position:Vector2 ):Vector2 {

  return {
    x: ( BOARD_SIZE - 1 ) - position.x,
    y: ( BOARD_SIZE - 1 ) - position.y,
  };

}
