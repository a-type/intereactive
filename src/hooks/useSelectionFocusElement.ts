import {
  useContext,
  useCallback,
  KeyboardEvent,
  useRef,
  useEffect,
  Ref,
} from 'react';
import SelectionContext from '../contexts/selection';
import { KeyCode } from '../types';
import { getMovementKeys, useCombinedRefs } from '../utils';

export type UseSelectionFocusElementOptions = {
  ref?: Ref<any>;
};

export const useSelectionFocusElement = ({
  ref,
}: UseSelectionFocusElementOptions) => {
  const { goToNext, goToPrevious, onSelect, setIsOpen } = useContext(
    SelectionContext
  );

  const onFocus = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onBlur = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      const movementKeys = getMovementKeys('vertical'); // TODO: configurable axis
      if (movementKeys.next.includes(ev.keyCode)) {
        goToNext();
        ev.preventDefault();
      } else if (movementKeys.previous.includes(ev.keyCode)) {
        goToPrevious();
        ev.preventDefault();
      } else if (ev.keyCode === KeyCode.Enter) {
        onSelect();
        ev.preventDefault();
      } else if (ev.keyCode === KeyCode.Escape) {
        setIsOpen(false);
        ev.preventDefault();
      }
    },
    [goToNext, goToPrevious, onSelect]
  );

  const internalRef = useRef<HTMLElement>(null);
  const combinedRef = useCombinedRefs(internalRef, ref);

  useEffect(() => {
    const handleClickDocument = (ev: MouseEvent) => {
      if (internalRef.current?.contains(ev.target as HTMLElement)) {
        return;
      }

      setIsOpen(false);
    };
    document.addEventListener('click', handleClickDocument);
    return () => {
      document.removeEventListener('click', handleClickDocument);
    };
  }, [internalRef, setIsOpen]);

  const props = {
    onKeyDown,
    onFocus,
    onBlur,
    ref: combinedRef,
  };

  return { props };
};
