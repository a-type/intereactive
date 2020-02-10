import {
  useContext,
  useCallback,
  KeyboardEvent,
  useRef,
  Ref,
  KeyboardEventHandler,
} from 'react';
import SelectionContext from '../contexts/selection';
import { KeyCode } from '../internal/types';
import { getMovementAction, useCombinedRefs } from '../internal/utils';
import { keyActionPresets, MovementAction } from '../keyActions';

export type UseSelectionFocusElementOptions = {
  /**
   * If you have an external ref you want to pass to the element
   * which will accept the props returned by this hook, pass it in here and it will
   * be merged with the hook's ref for you.
   */
  ref?: Ref<any>;
  /**
   * If you want to handle keyboard events for the element, pass your handler
   * in here to merge it as a convenience with this hook's internal handler.
   */
  onKeyDown?: KeyboardEventHandler<any>;
};

export type UseSelectionFocusElementReturn = {
  props: SelectionFocusElementProps;
};

/**
 * A set of props which power a "focusable element" for a Selection system. Pass
 * them to the element you want to serve as the focusable element, like an `<input>`.
 */
export type SelectionFocusElementProps = {
  onKeyDown: KeyboardEventHandler<any>;
  ref: Ref<any>;
};

/**
 * Returns props which can be passed to an element to cause it to be have as the
 * "focusable" element in a Selection system. Often, the "focusable" element is an
 * `<input>`, but it can be any type of element you like. Handlers will be attached
 * for listening to keyboard inputs to control the selected item. Must be the child
 * of a SelectionProvider.
 *
 * @category Selection
 */
export const useSelectionFocusElement = (
  options: UseSelectionFocusElementOptions
): UseSelectionFocusElementReturn => {
  const { ref, onKeyDown } = options;
  const { goToNext, goToPrevious, onSelect } = useContext(SelectionContext);

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      const action = getMovementAction(keyActionPresets.flat.any, ev.keyCode); // TODO: configurable axis
      if (action === MovementAction.GoNext) {
        goToNext();
        ev.preventDefault();
      } else if (action === MovementAction.GoPrevious) {
        goToPrevious();
        ev.preventDefault();
      } else if (ev.keyCode === KeyCode.Enter) {
        onSelect();
        ev.preventDefault();
      }
      onKeyDown && onKeyDown(ev);
    },
    [goToNext, goToPrevious, onSelect, onKeyDown]
  );

  const internalRef = useRef<HTMLElement>(null);
  const combinedRef = useCombinedRefs(internalRef, ref);

  const props: SelectionFocusElementProps = {
    onKeyDown: handleKeyDown,
    ref: combinedRef,
  };

  return { props };
};
