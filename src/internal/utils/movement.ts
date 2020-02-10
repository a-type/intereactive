import { KeyActions, MovementAction } from '../../keyActions';
import { KeyCode } from '../types';

export const getMovementAction = (keyActions: KeyActions, keyCode: KeyCode) => {
  switch (keyCode) {
    case KeyCode.ArrowUp:
      return keyActions.up;
    case KeyCode.ArrowDown:
      return keyActions.down;
    case KeyCode.ArrowLeft:
      return keyActions.left;
    case KeyCode.ArrowRight:
      return keyActions.right;
    default:
      return MovementAction.DoNothing;
  }
};
