import React, {
  createContext,
  Ref,
  ReactNode,
  forwardRef,
  useRef,
  RefObject,
  KeyboardEvent,
  useState,
  useEffect,
} from 'react';
import {
  useRefOrProvided,
  useIdOrGenerated,
  getMovementKeys,
  getNextIndex,
  getPreviousIndex,
} from '../utils';

export type SubFocusContextValue = {
  id: string | null;
  register(elementId: string, elementRef: Ref<HTMLElement> | null): void;
  unregister(elementId: string): void;
};

export const SubFocusContext = createContext<SubFocusContextValue | null>(null);

export type SubFocusProviderRenderProps = {
  isActive: boolean;
  props: {
    id: string;
    ref: Ref<HTMLElement>;
    onKeyDown(event: KeyboardEvent<HTMLElement>): void;
  };
};

export type SubFocusProviderProps = {
  id?: string;
  children(renderProps: SubFocusProviderRenderProps): ReactNode;
  axis?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
};

export const SubFocusProvider = forwardRef<any, SubFocusProviderProps>(
  ({ id: providedId, children, axis = 'both', wrap = true }, providedRef) => {
    const elementsRef = useRef<
      { id: string; ref: RefObject<HTMLElement> | null }[]
    >([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const ref = useRefOrProvided<HTMLElement>(providedRef);
    if (typeof ref === 'function') {
      throw new Error(
        'SubFocus only supports object refs for container element'
      );
    }

    const id = useIdOrGenerated(providedId);

    const movementKeys = getMovementKeys(axis);

    const register = (elementId: string, elementRef: Ref<HTMLElement>) => {
      if (typeof elementRef === 'function') {
        throw new Error('SubFocus only supports object refs for children');
      }

      elementsRef.current = [
        ...elementsRef.current,
        { id: elementId, ref: elementRef },
      ];
    };

    const unregister = (elementId: string) => {
      elementsRef.current = elementsRef.current.filter(
        ({ id }) => id !== elementId
      );
    };

    const findElementIndex = (searchId: string) => {
      const elements = elementsRef.current || [];
      return elements.findIndex(({ id }) => id === searchId);
    };

    const getElement = (index: number) => {
      const elements = elementsRef.current || [];
      const item = elements[index];
      if (!item || !item.ref) {
        return null;
      }
      return item.ref.current || null;
    };

    const syncTabIndex = (newIndex: number) => {
      setSelectedIndex(newIndex);
      (elementsRef.current || []).forEach(({ ref }, index) => {
        const element = ref && ref.current;
        if (!element) {
          return;
        }
        element.setAttribute('tabindex', index === newIndex ? '0' : '-1');
      });
    };

    const onGlobalFocus = (event: Event) => {
      const rootElement = ref && ref.current;
      if (rootElement && !rootElement.contains(event.target as HTMLElement)) {
        setIsActive(false);
      } else if (rootElement && !isActive) {
        const id = (event.target as HTMLElement).id;
        const elementIndex = findElementIndex(id);
        syncTabIndex(elementIndex);
        setIsActive(true);
      }
    };

    useEffect(() => {
      document.addEventListener('focusin', onGlobalFocus);
      return () => document.removeEventListener('focusin', onGlobalFocus);
    }, []);

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      const elements = elementsRef.current || [];

      const moveFocus = (index: number) => {
        const focusElement = getElement(index);

        if (focusElement) {
          focusElement.focus();
        }
      };

      if (movementKeys.next.includes(event.keyCode)) {
        const nextIdx = getNextIndex(selectedIndex, elements.length, wrap);
        moveFocus(nextIdx);
        event.preventDefault();
      } else if (movementKeys.previous.includes(event.keyCode)) {
        const previousIdx = getPreviousIndex(
          selectedIndex,
          elements.length,
          wrap
        );
        moveFocus(previousIdx);
        event.preventDefault();
      }
    };

    const renderProps = {
      isActive,
      props: {
        id,
        ref,
        onKeyDown,
      },
    };

    const contexValue = {
      register,
      unregister,
      id,
    };

    return (
      <SubFocusContext.Provider value={contexValue}>
        {children(renderProps)}
      </SubFocusContext.Provider>
    );
  }
);
