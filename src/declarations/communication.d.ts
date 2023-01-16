type PositionMessage = {
  type:'position'
  data: Vector2;
}
type HitMessage = {
  type:'hit'
  data:boolean;
}
type CommandMessage = {
  type:'command';
  data:Command;
}

type GameMessage = CommandMessage|HitMessage|PositionMessage;
