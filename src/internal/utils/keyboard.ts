import { KeyActions, Action } from '../../keyActions';
import { KeyCode } from '../types';

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
