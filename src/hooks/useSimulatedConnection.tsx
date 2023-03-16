import {
  useRef
} from 'react';


type Props = {
  onDisconnect():void;
  handleSentMessage?( message:GameMessage ):void;
};

export function useSimulatedConnection ( {
  onDisconnect,
  handleSentMessage,
}: Props ) {

  const eventListenersRef = useRef<Set<GameEventListener>>( new Set<GameEventListener>() );
  function fireMessage ( message:GameMessage ) {

    eventListenersRef.current.forEach( ( listener ) => listener( message ) );

  }
  return {
    fireMessage,
    addDataConnectionEventListener ( listener:GameEventListener ) {

      eventListenersRef.current.add( listener );
      return function clearEventListener () {

        eventListenersRef.current.delete( listener );

      };

    }

  };


}
