import { createContext, ReactNode, useContext } from 'react';
import { DataConnection } from 'peerjs';
import { usePeer } from './usePeer';
import { ConnectionPage } from '../components/ConnectionPage';

interface Connection extends DataConnection{
  send( message:GameMessage ):void
}

const connectionContext = createContext<Connection|null>( null );

export function useConnectionContext () {

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
    loading
  } = usePeer( { onOpen: console.log } );

  const gameReady = connection !== null && !error;
  return <>
    <ConnectionPage
      id={id}
      connect={connect}
      connected={!!connection}
      disconnectReason={error}
      loading={loading}
    />
    {gameReady && <connectionContext.Provider value={connection} >
      {children}
    </connectionContext.Provider>
    }
  </>;


}
