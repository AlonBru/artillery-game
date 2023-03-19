import { connectionInputContainerId } from './ConnectionPage';
import { copyIdButtonId, copyLinkButtonId, playerIdButtonId } from './IdDisplay';
import { TutorialStage } from './tutorialStages';
export const stages: Array<TutorialStage> = [
  // welcome
  {
    text: 'Welcome to Unnamed Artillery Game!',
    withNextButton: true,
  },
  {
    text: `The game is played with an online opponent.
Each player has a unique id assigned when opening the game.`,
    withNextButton: true,
    highlightedElementId: playerIdButtonId,
    disableInteractionWithHighlight: true
  },
  {
    text: `In order to connect, one player will copy the other's id and paste it in the input,
    then click the buttton.`,
    highlightedElementId: connectionInputContainerId,
    disableInteractionWithHighlight: true,
    withNextButton: true
  },
  {
    text: `You can use this button to copy your id,
so you can send it to a friend to play with.`,
    withNextButton: true,
    highlightedElementId: copyIdButtonId
  },
  {
    text: `You can use this button to copy your a direct link to the game,
which will auto-connect to you when opened.`,
    withNextButton: true,
    highlightedElementId: copyLinkButtonId
  },
  {
    text: 'You can set a custom id if you want by clicking your id, then typing what you want.',
    withNextButton: true,
    highlightedElementId: playerIdButtonId,
    disableInteractionWithHighlight: true
  },
  {
    text: `This is it for how to connect.
Let's pretend you have a friend to play with and move on to how to play.`,
    withNextButton: true,
    highlightedElementId: playerIdButtonId,
    disableInteractionWithHighlight: true
  },
];
