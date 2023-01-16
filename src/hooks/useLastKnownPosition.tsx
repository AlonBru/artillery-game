import { useEffect, useState } from 'react';
import { useConnectionContext } from './useConnection';

export function useLastKnownPosition () {

  const conn = useConnectionContext();
  const [ lastKnownPosition, setLastKnown ] = useState<Vector2 | null>( null );

  useEffect( () => {

    function handlePositionMessage ( data: unknown ) {

      if ( ( data as GameMessage ).type === 'position' ) {

        setLastKnown( ( data as PositionMessage ).data );

      }

    }
    conn.addListener(
      'data',
      handlePositionMessage
    );
    return () => {

      conn.removeListener(
        'data',
        handlePositionMessage
      );

    };

  } );
  return lastKnownPosition;

}
