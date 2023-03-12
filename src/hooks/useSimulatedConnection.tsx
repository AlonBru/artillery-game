import {
  createContext, ReactNode, useContext, useRef
} from 'react';

import { connectionContext } from './useConnection';

export interface SimulatedGameConnection {
  fireMessage( message:GameMessage ):void
}

/* eslint-disable-next-line max-len */
export const simulatedConnectionContext = createContext<SimulatedGameConnection|null>( null );

export function useSimulatedConnectionContext ( ) {

  const context = useContext( connectionContext );
  if ( !context ) {

    throw new Error( 'trying to useSimulatedConnectionContext without provider' );

  }

  return context;

}
type Props = {
  children: ReactNode | ReactNode[];
  onDisconnect():void;
  handleSentMessage( message:GameMessage ):void;
};

export function SimulatedConnectionProvider ( { children, onDisconnect, handleSentMessage }: Props ) {

  const eventListenersRef = useRef<Set<GameEventListener>>( new Set<GameEventListener>() );
  function fireMessage ( message:GameMessage ) {

    eventListenersRef.current.forEach( ( listener ) => listener( message ) );

  }
  return <>

    <simulatedConnectionContext.Provider
      value={{
        fireMessage
      }}
    >
      <connectionContext.Provider value={{
        sendMessage: handleSentMessage,
        addDataConnectionEventListener ( listener ) {

          eventListenersRef.current.add( listener );
          return function clearEventListener () {

            eventListenersRef.current.delete( listener );

          };

        },
        disconnect: onDisconnect

      }} >
        <button
          onClick={() => fireMessage( {
            type: 'rematch',
            gameMessage: true,
            data: 'request'
          } )}
        >
        kill
        </button>
        {children}
      </connectionContext.Provider>
    </simulatedConnectionContext.Provider>

  </>;


}
