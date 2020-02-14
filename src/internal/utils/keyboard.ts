import { KeyActions, Action } from '../../keyActions';
import { KeyCode } from '../types';
import { KeyboardEvent } from 'react';

export const getKeyboardAction = (keyActions: KeyActions, keyCode: KeyCode) => {
  switch (keyCode) {
    case KeyCode.ArrowUp:
      return keyActions.up;
    case KeyCode.ArrowDown:
      return keyActions.down;
    case KeyCode.ArrowLeft:
      return keyActions.left;
    case KeyCode.ArrowRight:
      return keyActions.right;
    case KeyCode.Enter:
      return keyActions.enter;
    case KeyCode.Space:
      return keyActions.space;
    default:
      return Action.DoNothing;
  }
};

export const processKeyboardEvent = (
  implementations: {
    goToNext: () => any;
    goToPrevious: () => any;
    goToNextOrthogonal: () => any;
    goToPreviousOrthogonal: () => any;
    goUp: () => any;
    goDown: () => any;
    select: () => any;
  },
  keyActions: KeyActions,
  event: KeyboardEvent<any>
) => {
  const keyCode: KeyCode = event.keyCode;
  const action = getKeyboardAction(keyActions, keyCode);
  if (action === Action.DoNothing) {
    return;
  }

  switch (action) {
    case Action.GoDown:
      implementations.goDown();
      break;
    case Action.GoUp:
      implementations.goUp();
      break;
    case Action.GoNext:
      implementations.goToNext();
      break;
    case Action.GoPrevious:
      implementations.goToPrevious();
      break;
    case Action.GoNextOrthogonal:
      implementations.goToNextOrthogonal();
      break;
    case Action.GoPreviousOrthogonal:
      implementations.goToPreviousOrthogonal();
      break;
  }

  event.preventDefault();
  event.stopPropagation();
};
