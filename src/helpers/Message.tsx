

abstract class GameMessageClass implements _IGameMessage {

  gameMessage = true as const;

 abstract type:GameMessage['type'];


}
export class HitMessage extends GameMessageClass implements IHitMessage {

  type: 'hit';

  data:Vector2;

  constructor ( data:Vector2 ) {

    super();
    const type = 'hit';
    this.type = type;
    this.data = data;

  }

}
export class CommandMessage extends GameMessageClass implements ICommandMessage {

  type:'command';

  data:FireCommand|null;

  constructor ( data:FireCommand|null ) {

    super();
    const type = 'command' as const;
    this.type = type;

    this.data = data;

  }

}
export class PositionMessage extends GameMessageClass implements IPositionMessage {

  type :'position';

  data:Vector2;

  constructor ( data:Vector2 ) {

    super( );
    const type = 'position' as const;
    this.type = type;
    this.data = data;

  }

}
export class RematchMessage extends GameMessageClass implements IRematchMessage {

  type:'rematch';

  data:IRematchMessage['data'];

  constructor ( data:IRematchMessage['data'] ) {

    super( );
    const type = 'rematch';
    this.type = type;
    this.data = data;

  }

}
