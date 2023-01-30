import { useEffect, useState } from 'react';
import { useConnectionContext } from './useConnection';

export function useLastKnownPosition () {

  const { addDataConnectionEventListener } = useConnectionContext();
  const [ lastKnownPosition, setLastKnown ] = useState<Vector2 | null>( null );

  useEffect(
    () => addDataConnectionEventListener( ( data ) => {

      if ( data.type === 'position' ) {

        setLastKnown( ( data as IPositionMessage ).data );

      }

    } )
  );
  return lastKnownPosition;

}
