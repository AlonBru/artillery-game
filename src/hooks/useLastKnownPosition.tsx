import { useEffect, useState } from 'react';
import { useConnectionContext } from './useConnection';

export function useLastKnownPosition () {

  const { addDataConnectionEventListener } = useConnectionContext();
  const [ lastKnownPosition, setLastKnown ] = useState<Vector2 | null>( null );

  useEffect( () => addDataConnectionEventListener(
    ( data: unknown ) => {

      if ( ( data as GameMessage ).type === 'position' ) {

        setLastKnown( ( data as PositionMessage ).data );

      }

    }
  ) );
  return lastKnownPosition;

}
