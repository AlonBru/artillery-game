import { createContext, useContext } from 'react';
import { DataConnection } from 'peerjs';

export const connectionContext = createContext<DataConnection|null>( null );

export function useConnection () {

  const context = useContext( connectionContext );
  if ( !context ) {

    throw new Error( 'trying touseConnection without provider' );

  }
  return context;

}
