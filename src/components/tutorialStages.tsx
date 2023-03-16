import { battleGridId, CraterClassName, lastKnownPositionId } from './Board';
import { communicationDisplayId, reloadButtonId } from './CommandPanel';
import { CommandMessage, HitMessage, PositionMessage } from '../helpers/Message';
import { commandSelectorId } from './CommandSelector';
import { BOARD_SIZE } from '../constants';
import { instructionsPanelId } from './InstructionsMaker';

export type GameConditions = {

  /** currently selected command mode */
  commandMode:SelectableCommandMode;

  /** whether the player has placed their unit */
  isUnitPlaced:boolean
}
type TutorialStage = {

  /** tutorial text  */
  text: string;

  /** id or className of element to highlight for this stage  */
  highlightedElementId?:string;

  /** whether to prevent interaction with highlighted element */
  disableInteractionWithHighlight?:true;


  /** show a button to continue to next stage */
  withNextButton?:boolean;

  /** event type ( caused by player) to continue to next stage  */
  moveNextOn?:GameMessage['type'];

  /** event ( simulated opponent) to fire when continuing to next stage */
  eventToFireOnNext?:GameMessage;

  /** conditions to allow clicking next button */
  allowNextConditions?:Partial<GameConditions>;

  /** conditions to automatically continue to next stage */
  autoSkipConditions?:Partial<GameConditions>;
}

export const stages: Array<TutorialStage> = [
  // welcome
  {
    text: 'Welcome to unnamed artillery game!',
    withNextButton: true
  },
  // objective
  {
    text: 'The aim of the game is to destroy the enemy unit while avoiding the same fate for your unit.',
    withNextButton: true
  },
  // controls header
  {
    text: 'First, let\'s get to know the controls:',
    withNextButton: true
  },
  // battle grid recognition
  {
    text: `On the left is the battle grid.
It is a representation of the battle field.
On it will be displayed your unit and other elements that are in the field.`,
    withNextButton: true,
    highlightedElementId: battleGridId,
    disableInteractionWithHighlight: true
  },
  // deploy your unit
  {
    text: `Let's deploy your unit. 
Click the grid square on which you'd like to deploy.
Units can only deploy on the bottom row, which is highlighted at the start of the game.`,
    highlightedElementId: battleGridId,
    autoSkipConditions: {
      isUnitPlaced: true
    }
  },
  // unit deployed
  {
    text: 'Great, notice your unit is on the board now.',
    highlightedElementId: battleGridId,
    withNextButton: true
  },
  // waiting for opponent, status display recognition
  {
    text: `Notice this screen, it provides you with information you can use.
Right now it says 'awainting an update from the field'.
This means your opponent has not made a move yet in this turn.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true
  },
  // how turns work
  {
    text: `The turns in the game take effect at the same time.
This means that once you have made your move, you will need to wait for your opponent to make their.
Then, both moves will take place and you will both see the results of the turn. 
For the time being the tutorial will move right ahead as if your opponent is very quick to respond.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true,
    eventToFireOnNext: new CommandMessage( null )
  },
  // opponent has placed their unit
  {
    text: `Now your opponent has deployed their unit and the game can begin.
They do not see where you placed your unit, and you don't see their position. 
Your status screen tells you that you are ready to go, and is requesting your command.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true,
  },
  // command selector recognition
  {
    text: `Notice below the status screen your command mode selector.
When you change it it also updates the status display above it.
To continue, make sure the MOVE command is selected. 
`,
    highlightedElementId: commandSelectorId,
    withNextButton: true,
    allowNextConditions: {
      commandMode: 'MOVE'
    }
  },
  // issue MOVE command
  {
    text: `A MOVE command can be issued using the battle grid.
Your unit can move to the adjacent grid squares, highlighted on the battle grid.
Try issuing a MOVE command by clicking a highlighted grid square.
`,
    highlightedElementId: battleGridId,
    moveNextOn: 'command',
    eventToFireOnNext: new CommandMessage( null ),
  },
  // unit moved
  {
    text: `Your unit has moved to the selected grid area.
`,
    highlightedElementId: battleGridId,
    withNextButton: true,
    disableInteractionWithHighlight: true
  },
  // select FIRE command
  {
    text: `Now let's explore the other commands at your disposal.
You can change command modes by clicking the command mode selector. 
Please select the FIRE mode to continue.
  `,
    highlightedElementId: commandSelectorId,
    eventToFireOnNext: new CommandMessage( null ),
    withNextButton: true,
    allowNextConditions: {
      commandMode: 'FIRE'
    }
  },
  // issue FIRE command
  {
    text: `You can select any highlighted square to fire on.
You can never fire on your own position.
Please fire somewhere on the battle grid.
  `,
    highlightedElementId: battleGridId,
    eventToFireOnNext: new PositionMessage( {
      x: BOARD_SIZE - 1,
      y: Math.round( Math.random() * BOARD_SIZE )
    } ),
    moveNextOn: 'command'
  },
  // shelled zone recognition
  {
    text: `Notice the position you have fired on is now marked by an X.
This is now a shelled area, which cannot be moved into.
This can be used to block enemy movement.`,
    highlightedElementId: CraterClassName,
    withNextButton: true,
  },
  // last-known-position recognition
  {
    text: `Note as well the triangle that appeared on the screen. 
It will appear when you shoot, and mark where the enemy unit is at that time.
The enemy will also be able to see your position when they shoot, of course.
`,
    highlightedElementId: lastKnownPositionId,
    withNextButton: true,
  },
  // RELOAD recongnition
  {
    text: `After you shoot, you will have to reload before you can shoot again.
Your communication screen will tell you your shell is spent and you will not be able to select the FIRE mode,
instead you will have the RELOAD mode available.
`,
    highlightedElementId: communicationDisplayId,
    withNextButton: true,
  },

  /*
   * Add a move when not loaded stage ( player gets shot at)
   * {}
   */
  // Reload button recognition, select RELOAD command
  {
    text: `When in RELOAD mode, The button under the selector will light up.
It's used to reload your unit's cannon.
Select the RELOAD mode to continue.`,
    highlightedElementId: commandSelectorId,
    autoSkipConditions: {
      commandMode: 'RELOAD'
    }
  },
  // issue reload command
  {
    text: `Click the button to reload.
`,
    highlightedElementId: reloadButtonId,
    eventToFireOnNext: new CommandMessage( null ),
    moveNextOn: 'command'
  },
  // how to win
  {
    text: 'You are now reloaded and are able to fire again.',
    highlightedElementId: reloadButtonId,
    eventToFireOnNext: new HitMessage( {
      x: BOARD_SIZE - 1,
      y: Math.round( Math.random() * BOARD_SIZE )
    } ),
    withNextButton: true
  },
  // endgame recognition
  {
    text: 'This is how it would look if you were to hit the enemy unit.',
    highlightedElementId: battleGridId,
    disableInteractionWithHighlight: true,
    withNextButton: true
  },
  // instructions button recognition
  {
    text: `If you need to review the rules while in game, you can use the 'i' instructions button.
Once you use it it will also cease to flash.
To clear the instructions page, click it.`,
    highlightedElementId: instructionsPanelId,
    withNextButton: true
  },
  // End
  {
    text: 'You know the basics. Go get them tiger!',
    highlightedElementId: communicationDisplayId,
  }
];
