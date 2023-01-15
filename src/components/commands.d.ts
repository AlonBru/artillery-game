type CommandMode = 'INITIAL'|'MOVE'|'FIRE'|'RELOAD';

type BoardAction = {
  position:Vector2;
  type:CommandMode;
 }
type Item = 'PLAYER'|null
type Board = Array<Item[]>
