import { useEffect, useState } from 'react';
import { useConnectionContext } from './useConnection';
import { useGameLogic } from './useGameManager';

export function useLastKnownPosition () {

  const { endGame } = useGameLogic();
  const { addDataConnectionEventListener } = useConnectionContext();
  const [ lastKnownPosition, setLastKnown ] = useState<Vector2 | null>( null );
  useEffect(
    () => addDataConnectionEventListener( ( data ) => {

      if ( data.type === 'position' ) {

        setLastKnown( ( data as IPositionMessage ).data );

      }

    } )
  );

  useEffect( /** Reset when the game is reset */
    () => {

      if ( !endGame ) {

        setLastKnown( null );

      }

    },
    [ endGame ]
  );

  return lastKnownPosition;

}
