import { useContext } from 'react';
import { FocusContext } from '../contexts/focus';

/**
 * Allows imperatively triggering focus on an element which uses
 * the useFocusable hook, by passing its registered id.
 *
 * @category Focus
 */
export const useImperativeFocus = () => {
  const focusContext = useContext(FocusContext);

  return focusContext.focus;
};
