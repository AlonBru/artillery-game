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
export class DeployCommandFiredEvent extends CustomEvent<{position:Vector2}> {


  type = 'unitPlaced' as const;

  constructor ( position:Vector2 ) {

    super(
      'unitPlaced',
      { detail: { position } }
    );

  }

}
export class MoveCommandFiredEvent extends CustomEvent<{position:Vector2}> {


  type = 'unitMoved' as const;

  constructor ( position:Vector2 ) {

    super(
      'unitMoved',
      { detail: { position } }
    );

  }

}
type GameEvent = typeof CommandModeChangeEvent
| typeof DeployCommandFiredEvent
| typeof MoveCommandFiredEvent

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

