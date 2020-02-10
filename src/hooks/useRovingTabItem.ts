import {
  useContext,
  useRef,
  Ref,
  MutableRefObject,
  useCallback,
  KeyboardEvent,
} from 'react';
import RovingTabContext from '../contexts/rovingTab';
import { KeyCode } from '../internal/types';
import { getMovementAction } from '../internal/utils/movement';
import { KeyActions, keyActionPresets, MovementAction } from '../keyActions';
import {
  KEY_DATA_ATTRIBUTE,
  VALUE_DATA_ATTRIBUTE,
  INDEX_DATA_ATTRIBUTE,
} from '../internal/constants';

export type UseRovingTabItemOptions<T extends HTMLElement = any> = {
  /**
   * Optionally supply a value represented by this
   * item. This value will be reported by the RovingTabProvider if the user selects the
   * item.
   */
  value?: string;
  /**
   * If you have an external ref you want to pass to the element
   * which will accept the props returned by this hook, pass it in here and it will
   * be merged with the hook's ref for you.
   */
  ref?: Ref<T>;
  /**
   * For advanced use cases like virtualization, you can manually
   * specify the ordering of this item. If omitted, order will be inferred by DOM
   * structure.
   */
  index?: number;
  /**
   * Determines the keyboard arrow directions which can be used
   * to move from this item to next or previous items. By default the user can use
   * up or left to go back, and down or right to go forward (flat.any preset)
   */
  keyActions?: KeyActions;
};

/**
 * Returns props which can be passed to an element to include it in a roving
 * tab system. Components which use this hook must be children of a RovingTabProvider.
 *
 * @category Roving Tab
 */
export const useRovingTabItem = <T extends HTMLElement>(
  options: UseRovingTabItemOptions<T> = {}
) => {
  const { value, ref, index, keyActions = keyActionPresets.flat.any } = options;
  const {
    onSelect,
    goToNext,
    goToPrevious,
    selectedKey,
    goUp,
    goDown,
  } = useContext(RovingTabContext);
  const { current: key } = useRef(
    value || `suggestion-${Math.floor(Math.random() * 10000000000)}`
  );
  const elementRef = useRef<T | null>(null);
  const combinedRef = useCallback(
    (el: T) => {
      elementRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as MutableRefObject<any>).current = el;
      }
    },
    [elementRef, ref]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<any>) => {
      const action = getMovementAction(keyActions, event.keyCode);

      if (action === MovementAction.GoNext) {
        goToNext(key);
        event.preventDefault();
        event.stopPropagation();
      } else if (action === MovementAction.GoPrevious) {
        goToPrevious(key);
        event.preventDefault();
        event.stopPropagation();
      } else if (action === MovementAction.GoUp) {
        goUp();
        event.preventDefault();
        event.stopPropagation();
      } else if (action === MovementAction.GoDown) {
        goDown();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.keyCode === KeyCode.Enter) {
        onSelect(key, value);
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [onSelect, key, value, goToNext, goToPrevious, keyActions]
  );

  const handleClick = useCallback(() => {
    onSelect(key, value);
  }, [onSelect, key, value]);

  // const handleFocus = useCallback(() => {
  //   onSelect(key, value);
  // }, [onSelect, key, value]);

  const isSelected = selectedKey === key;
  const isTabbable = isSelected;

  return {
    props: {
      ref: combinedRef,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      //onFocus: handleFocus,
      [KEY_DATA_ATTRIBUTE]: key,
      [VALUE_DATA_ATTRIBUTE]: value,
      [INDEX_DATA_ATTRIBUTE]: index,
      tabIndex: isTabbable ? 0 : -1,
    },
    selected: isSelected,
  };
};
