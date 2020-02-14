import {
  useContext,
  useRef,
  Ref,
  MutableRefObject,
  useCallback,
  KeyboardEvent,
} from 'react';
import RovingTabContext from '../contexts/rovingTab';
import { processKeyboardEvent } from '../internal/utils/keyboard';
import { KeyActions, keyActionPresets } from '../keyActions';
import { normalizeCoordinate } from '../internal/utils/indexing';
import { DISABLED_ATTRIBUTE } from '../internal/constants';
import {
  KEY_DATA_ATTRIBUTE,
  VALUE_DATA_ATTRIBUTE,
  X_INDEX_DATA_ATTRIBUTE,
  Y_INDEX_DATA_ATTRIBUTE,
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
   * For advanced use cases, you can manually specify the ordering of this item. If
   * omitted, order will be inferred by DOM structure.
   */
  coordinate?: number | [number, number];
  /**
   * Determines the keyboard arrow directions which can be used
   * to move from this item to next or previous items. By default the user can use
   * up or left to go back, and down or right to go forward (flat.any preset)
   */
  keyActions?: KeyActions;
  /**
   * If disabled, this item will still exist within the selection navigation,
   * but the user won't be able to select it.
   */
  disabled?: boolean;
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
  const {
    value,
    ref,
    coordinate,
    keyActions = keyActionPresets.flat.any,
    disabled,
  } = options;
  const {
    onSelect,
    goToNext,
    goToPrevious,
    selectedKey,
    goUp,
    goDown,
    goToNextOrthogonal,
    goToPreviousOrthogonal,
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

  // TODO: use event callback (ref style)
  // to increase perf
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<any>) => {
      processKeyboardEvent(
        {
          goToNext,
          goToPrevious,
          goToNextOrthogonal,
          goToPreviousOrthogonal,
          goUp,
          goDown,
          select: () => {
            if (!disabled) {
              onSelect(key, value);
            }
          },
        },
        keyActions,
        event
      );
    },
    [
      onSelect,
      key,
      value,
      goToNext,
      goToPrevious,
      goToNextOrthogonal,
      goToPreviousOrthogonal,
      goUp,
      goDown,
      keyActions,
      disabled,
    ]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    onSelect(key, value);
  }, [onSelect, key, value, disabled]);

  const isSelected = selectedKey === key;
  const isTabbable = isSelected;

  const [manualXCoordinate, manualYCoordinate] = normalizeCoordinate(
    coordinate
  );

  return {
    props: {
      ref: combinedRef,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      //onFocus: handleFocus,
      [KEY_DATA_ATTRIBUTE]: key,
      [VALUE_DATA_ATTRIBUTE]: value,
      [X_INDEX_DATA_ATTRIBUTE]: manualXCoordinate,
      [Y_INDEX_DATA_ATTRIBUTE]: manualYCoordinate,
      [DISABLED_ATTRIBUTE]: disabled,
      tabIndex: isTabbable ? 0 : -1,
    },
    selected: isSelected,
    disabled,
  };
};
