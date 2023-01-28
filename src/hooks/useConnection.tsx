import {
  createContext, ReactNode, useContext
} from 'react';
import { usePeer } from './usePeer';
import { ConnectionPage } from '../components/ConnectionPage';


interface Connection {
  sendMessage( message:GameMessage ):void

  /** returns a cleanup function */
  addDataConnectionEventListener( listener:GameEventListener ):()=>void;
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
    id,
    connect,
    error,
    loading: status,
    disconnect,
    addDataConnectionEventListener,
    sendMessage
  } = usePeer( { onOpen: console.log } );

  const gameReady = status === 'READY' && !error;
  return <>

    <ConnectionPage
      id={id}
      connect={connect}
      connected={status === 'READY'}
      disconnectReason={error}
      status={status}
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
