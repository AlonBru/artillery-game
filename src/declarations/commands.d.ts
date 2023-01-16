type CommandMode = 'INITIAL'|'MOVE'|'FIRE'|'RELOAD';

type BoardAction = {
  type:CommandMode;
}
type Item = 'PLAYER'|null
type Board = Array<Item[]>
type MoveCommand = {
  type: 'MOVE';
  target: Vector2;
};
type FireCommand = {
  type: 'FIRE';
  target: Vector2;
};
type ReloadCommand = {
  type: 'RELOAD';
};
type PlaceCommand = {
  type: 'INITIAL';
  target: Vector2;
};
type Command = MoveCommand | FireCommand | ReloadCommand | PlaceCommand;
