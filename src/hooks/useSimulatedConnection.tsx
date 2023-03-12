import {
  ComponentPropsWithoutRef,
  createContext,
  useCallback,
  useRef
} from 'react';

import { connectionContext } from './useConnection';

export interface SimulatedGameConnection {
  fireMessage( message:GameMessage ):void
  SimulatedConnectionProvider( props:ComponentPropsWithoutRef<'div'> ):JSX.Element
}

/* eslint-disable-next-line max-len */
export const simulatedConnectionContext = createContext<SimulatedGameConnection|null>( null );

type Props = {
  onDisconnect():void;
  handleSentMessage( message:GameMessage ):void;
};

export function useSimulatedConnection ( {
  onDisconnect,
  handleSentMessage,
}: Props ):SimulatedGameConnection {

  const eventListenersRef = useRef<Set<GameEventListener>>( new Set<GameEventListener>() );
  function fireMessage ( message:GameMessage ) {

    eventListenersRef.current.forEach( ( listener ) => listener( message ) );

  }
  const SimulatedConnectionProvider = useCallback(
    ( { children }:ComponentPropsWithoutRef<'div'> ) => (
      <connectionContext.Provider
        value={{
          sendMessage: handleSentMessage,
          addDataConnectionEventListener ( listener ) {

            eventListenersRef.current.add( listener );
            return function clearEventListener () {

              eventListenersRef.current.delete( listener );

            };

          },
          disconnect: onDisconnect

        }}

      >{children}</connectionContext.Provider>
    ),
    [ handleSentMessage,
      onDisconnect ]
  );
  return {
    fireMessage,
    SimulatedConnectionProvider

  };


}
