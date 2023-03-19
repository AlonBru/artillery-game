
type Item = 'PLAYER'|'CRATER'|'DESTROYED'|null
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

type CommandMode = Command['type'];
type SelectableCommandMode = Exclude<CommandMode, 'INITIAL'>

/**
 * Commands that require a board update
 */
type UICommand = Exclude<Command, ReloadCommand>
