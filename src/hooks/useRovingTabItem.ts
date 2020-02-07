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
import { getMovementKeys } from '../internal/utils';
import {
  KEY_DATA_ATTRIBUTE,
  VALUE_DATA_ATTRIBUTE,
  INDEX_DATA_ATTRIBUTE,
} from '../internal/constants';

export type UseRovingTabItemOptions = {
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
  ref?: Ref<any>;
  /**
   * For advanced use cases like virtualization, you can manually
   * specify the ordering of this item. If omitted, order will be inferred by DOM
   * structure.
   */
  index?: number;
  /**
   * Determines the keyboard arrow directions which can be used
   * to move from this item to next or previous items. By default the user can use
   * up or left to go back, and down or right to go forward.
   */
  axis?: 'vertical' | 'horizontal' | 'both';
};

/**
 * Returns props which can be passed to an element to include it in a roving
 * tab system. Components which use this hook must be children of a RovingTabProvider.
 *
 * @category Roving Tab
 */
export const useRovingTabItem = (options: UseRovingTabItemOptions = {}) => {
  const { value, ref, index, axis = 'both' } = options;
  const { onSelect, goToNext, goToPrevious, selectedKey } = useContext(
    RovingTabContext
  );
  const { current: key } = useRef(
    value || `suggestion-${Math.floor(Math.random() * 10000000000)}`
  );
  const elementRef = useRef<HTMLElement | null>(null);
  const combinedRef = useCallback(
    (el: HTMLElement) => {
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
      const movementKeys = getMovementKeys(axis);

      if (movementKeys.next.includes(event.keyCode)) {
        goToNext(key);
        event.preventDefault();
      } else if (movementKeys.previous.includes(event.keyCode)) {
        goToPrevious(key);
        event.preventDefault();
      } else if (event.keyCode === KeyCode.Enter) {
        onSelect(key, value);
        event.preventDefault();
      }
    },
    [onSelect, key, value, goToNext, goToPrevious]
  );

  const handleClick = useCallback(() => {
    onSelect(key, value);
  }, [onSelect, key, value]);

  return {
    props: {
      ref: combinedRef,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      [KEY_DATA_ATTRIBUTE]: key,
      [VALUE_DATA_ATTRIBUTE]: value,
      [INDEX_DATA_ATTRIBUTE]: index,
      tabIndex: selectedKey === key ? 0 : -1,
    },
    selected: selectedKey === key,
  };
};
