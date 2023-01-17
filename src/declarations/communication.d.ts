type PositionMessage = {
  type:'position'
  data: Vector2;
}
type HitMessage = {
  type:'hit'
  data:boolean;
}

/**
 * Should only receive fire commands from peer, other commands are not specified
 */
type CommandMessage = {
  type:'command';
  data:FireCommand|null;
}

type GameMessage = CommandMessage|HitMessage|PositionMessage;
