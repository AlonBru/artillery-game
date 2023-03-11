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
  const [ userSetId, setId ] = useState<string>( );
  const [ serverId, setServerId ] = useState<string>( );
  const [ connectionStatus, setConnectionStatus ] = useState<ConnectionStatus>( 'DISCONNECTED' );
  const [ peerError, setPeerError ] = useState<string>( );
  const [ connectionError, setConnectionError ] = useState<string>( );

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
            setConnectionError( ( error as any ).type );

          }
        );
        setConnectionError( undefined );
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

      setPeerError( undefined );
      if ( !peerRef.current || peerRef.current.destroyed ) {

        if ( !userSetId ) {

          peerRef.current = new Peer();

        } else {

          peerRef.current = new Peer( userSetId );
          setServerId( undefined );

        }

      }
      const { current: peer } = peerRef;
      peer.on(
        'open',
        handlePeerOpen
      );
      peer.on(
        'error',
        handlePeerError
      );
      peer.on(
        'connection',
        handleConnection
      );
      return () => {

        if ( !peer.destroyed ) {

          peer.removeListener(
            'open',
            handlePeerOpen
          );
          peer.removeListener(
            'error',
            handlePeerError
          );
          peer.removeListener(
            'connection',
            handleConnection
          );

          peer.destroy();

        }

      };
      function handlePeerOpen ( peerId: string ): void {

        if ( !userSetId ) {

          setServerId( peerId );

        }
        onOpen( peerId );

      }
      function handlePeerError ( error: Error ) {

        console.error( error );
        const { message } = error;
        if ( message.startsWith( 'ID' ) && message.endsWith( 'is taken' ) ) {

          setPeerError( `${error.message}, please select another` );

        }

      }


    },
    /* eslint-disable-next-line function-paren-newline */
    [
      userSetId,
      onOpen,
      handleConnection
    ]
  );

  const { current: peer } = peerRef;


  const connect = ( peerId:string ) => {

    setConnectionError( undefined );
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

            setConnectionError( 'Peer does not exist or already in a game' );
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
    id: userSetId || serverId,
    connectionError,
    peerError,
    loading: connectionStatus,
    connect,
    disconnect,
    sendMessage,
    addDataConnectionEventListener,
    setId
  };
  function handleConnectionClosed ( reason:string|undefined = 'Player left' ) {

    setConnectionError( reason );
    setConnectionStatus( 'DISCONNECTED' );
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
