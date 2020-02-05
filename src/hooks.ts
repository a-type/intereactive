import {
  useContext,
  useRef,
  Ref,
  MutableRefObject,
  useCallback,
  KeyboardEvent,
  useEffect,
} from 'react';
import SelectionContext from './contexts/selection';
import { KeyCode } from './types';
import { getMovementKeys, useIdOrGenerated, useRefOrProvided } from './utils';
import { FocusContext } from './contexts/focus';
import {
  KEY_DATA_ATTRIBUTE,
  VALUE_DATA_ATTRIBUTE,
  INDEX_DATA_ATTRIBUTE,
} from './constants';

export type UseSelectableOptions = {
  value?: string;
  ref?: Ref<any>;
  index?: number;
  axis?: 'vertical' | 'horizontal' | 'both';
};

export const useSelectable = ({
  value,
  ref,
  index,
  axis = 'both',
}: UseSelectableOptions = {}) => {
  const { onSelect, goToNext, goToPrevious, selectedKey } = useContext(
    SelectionContext
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

export type FocusableConfig<T extends HTMLElement> = {
  id?: string;
  ref?: Ref<T> | null;
};

export const useFocusable = <T extends HTMLElement>({
  id: providedId,
  ref: providedRef,
}: FocusableConfig<T>) => {
  const id = useIdOrGenerated(providedId, 'focusable');

  const focusContext = useContext(FocusContext);

  const ref = useRefOrProvided<T>(providedRef);

  useEffect(() => {
    if (!focusContext) {
      return;
    }

    focusContext.register(id, ref);
    return () => focusContext.unregister(id);
  }, [focusContext && focusContext.id, ref]);

  return {
    id,
    ref,
    tabIndex: 0,
  };
};
