/* eslint-disable no-use-before-define */

/**
 * Used for extending only
 */
abstract interface _IGameMessage{
  gameMessage:true;
  type: ( IPositionMessage|IHitMessage|ICommandMessage )['type'];
}
interface IPositionMessage extends _IGameMessage {
  type:'position';
  data: Vector2;
}
interface IHitMessage extends _IGameMessage {
  type:'hit';
  data:Vector2;
}

/**
 * Should only receive fire commands from peer, other commands are not specified
 */
interface ICommandMessage extends _IGameMessage {
  type:'command';
  data:FireCommand|null;
}

/** Includes all message types  */
type GameMessage = ICommandMessage | IHitMessage | IPositionMessage;

type ConnectionStatus = 'READY' | 'LOADING' | 'DISCONNECTED';
type GameEventListener = ( message:GameMessage )=>void
