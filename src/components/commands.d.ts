type CommandMode = 'INITIAL'|'MOVE'|'FIRE'|'RELOAD';

type BoardAction = {
  type:CommandMode;
}
type Item = 'PLAYER'|null
type Board = Array<Item[]>
