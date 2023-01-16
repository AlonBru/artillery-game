import { createContext, useContext } from 'react';
import { DataConnection } from 'peerjs';

interface Connection extends DataConnection{
  send( message:GameMessage ):void
}

export const connectionContext = createContext<Connection|null>( null );

export function useConnectionContext () {

  const context = useContext( connectionContext );
  if ( !context ) {

    throw new Error( 'trying touseConnection without provider' );

  }
  return context;

}
