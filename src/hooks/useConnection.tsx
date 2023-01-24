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
    connect
  } = usePeer( { onOpen: console.log } );

  return <>
    <ConnectionPage
      id={id}
      connect={connect}
      connected={!!connection}
    />
    {connection !== null && <connectionContext.Provider value={connection} >
      {children}
    </connectionContext.Provider>
    }
  </>;


}
