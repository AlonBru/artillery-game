import { useEffect } from 'react';

export class CommandModeChangeEvent extends CustomEvent<{mode:SelectableCommandMode}> {


  type = 'commandModeChange' as const;

  constructor ( mode:SelectableCommandMode ) {

    super(
      'commandModeChange',
      { detail: { mode } }
    );

  }

}
export class UnitPlacedEvent extends CustomEvent<undefined> {


  type = 'unitPlaced' as const;

  constructor ( ) {

    super(
      'unitPlaced'
    );

  }

}
type GameEvent = typeof CommandModeChangeEvent
| typeof UnitPlacedEvent

export function fireGameEvent ( event:InstanceType<GameEvent> ) {

  document.dispatchEvent( event );

}
type GameEventName<T extends GameEvent> = InstanceType<T>['type'];

export function useSubscribeToGameEvent<T extends GameEvent> (
  eventName:GameEventName<T>,
  listener: ( event:InstanceType<T> )=>void,
  dependencies:any[]
) {

  useEffect(
    () => subscribeToGameEvent(
      eventName,
      listener
    ),
    [
      eventName,
      listener,
      ...dependencies
    ]
  );

}

/**
 *
 * @param eventName
 * @param listener
 * @returns cleanup function
 */
function subscribeToGameEvent<T extends GameEvent> (
  eventName: GameEventName<T>,
  listener: ( event: InstanceType<T> ) => void
):()=>void {

  document.addEventListener(
    eventName,
      listener as unknown as EventListener
  );
  return () => {

    document.removeEventListener(
      eventName,
        listener as unknown as EventListener
    );

  };

}

