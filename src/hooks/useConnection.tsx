import {
  createContext, ReactNode, useContext
} from 'react';
import { usePeer } from './usePeer';
import { ConnectionPage } from '../components/ConnectionPage';


type EventListener = ( ( data:unknown|GameMessage )=>void )

interface Connection {
  sendMessage( message:GameMessage ):void

  /** returns a cleanup function */
  addDataConnectionEventListener( listener:EventListener ):()=>void;
  disconnect():void;
}

const connectionContext = createContext<Connection|null>( null );

export function useConnectionContext ( ) {

  const context = useContext( connectionContext );
  if ( !context ) {

    throw new Error( 'trying touseConnection without provider' );

  }

  return context;

}


export function ConnectionProvider ( { children }: {children:ReactNode|ReactNode[]} ) {

  const {
    connection,
    id,
    connect,
    error,
    loading,
    disconnect
  } = usePeer( { onOpen: console.log } );
  function sendMessage ( message:GameMessage ) {

    if ( connection === null ) {

      throw new Error( 'Tried to send a message on non-existnet connection' );

    }
    connection.send( message );

  }
  function addDataConnectionEventListener ( listener:EventListener ) {

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


  }
  const gameReady = connection !== null && !error;
  return <>

    <ConnectionPage
      id={id}
      connect={connect}
      connected={!!connection}
      disconnectReason={error}
      loading={loading}
    />
    {gameReady && <connectionContext.Provider value={{
      sendMessage,
      addDataConnectionEventListener,
      disconnect
    }} >
      {children}
    </connectionContext.Provider>
    }
  </>;


}
