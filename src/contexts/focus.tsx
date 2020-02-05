import React, {
  createContext,
  RefObject,
  useCallback,
  Ref,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
} from 'react';
import { useRefOrProvided } from '../utils';

export type FocusContextValue = {
  id: string | null;
  register(elementId: string, elementRef: Ref<HTMLElement> | null): void;
  unregister(elementId: string): void;
  focus(elementId: string): void;
};

export const FocusContext = createContext<FocusContextValue>({
  id: null,
  register: () => {},
  unregister: () => {},
  focus: () => {},
});

export type FocusProviderRenderProps<T extends HTMLElement> = {
  ref: Ref<T>;
};

export type FocusProviderProps<T extends HTMLElement> = {
  groupName?: string;
  ref?: Ref<HTMLElement>;
  children(renderProps: FocusProviderRenderProps<T>): ReactNode;
  trapFocus?: boolean;
};

export const FocusProvider = forwardRef<any, FocusProviderProps<any>>(
  ({ groupName, trapFocus, children, ...rest }, providedRef) => {
    const elementsRef = useRef<
      { id: string; ref: RefObject<HTMLElement> | null }[]
    >([]);

    const ref = useRefOrProvided<HTMLElement>(providedRef);
    const lastFocusedRef = useRef<HTMLElement | null>(null);

    if (typeof ref === 'function') {
      // FIXME
      throw new Error('FocusProvider requires an object-style ref');
    }

    useEffect(() => {
      console.debug(`Registering focus provider`);
      if (!ref || !trapFocus) {
        console.debug(`Bailing: ${ref}, ${!trapFocus}`);
        return;
      }

      const container =
        ref.current || (typeof children !== 'function' ? document : null);

      if (!container) {
        console.warn(`No container element attached to FocusProvider`);
        return;
      }

      const trapFocusInside = (ev: Event) => {
        console.debug(`Running focus trap`);
        const target = ev.target as HTMLElement;
        if (container.contains(target)) {
          lastFocusedRef.current = target;
          console.debug(`Element ${target} is within container`);
          return;
        }

        const firstFocusable = elementsRef.current[0];
        const firstFocusableElement =
          firstFocusable && firstFocusable.ref && firstFocusable.ref.current;
        console.debug(`first: `, firstFocusableElement);
        if (lastFocusedRef.current === firstFocusableElement) {
          console.debug(`Was on first element, wrapping to last`);
          const lastFocusable =
            elementsRef.current[elementsRef.current.length - 1];
          const lastFocusableElement =
            lastFocusable && lastFocusable.ref && lastFocusable.ref.current;
          if (lastFocusableElement) {
            lastFocusableElement.focus();
            lastFocusedRef.current = lastFocusableElement;
            ev.preventDefault();
          }
        } else if (firstFocusableElement) {
          console.debug(`Focusing first`);
          firstFocusableElement.focus();
          lastFocusedRef.current = firstFocusableElement;
          ev.preventDefault();
        } else {
          return;
        }
      };

      document.addEventListener('focusin', trapFocusInside);
      return () => document.removeEventListener('focusin', trapFocusInside);
    }, [ref && ref.current, trapFocus]);

    const register = useCallback(
      (elementId: string, elementRef: Ref<HTMLElement>) => {
        if (
          typeof elementRef === 'function' ||
          typeof elementRef === 'string'
        ) {
          throw new Error('Only object refs are supported');
        }

        elementsRef.current = [
          ...elementsRef.current,
          { id: elementId, ref: elementRef },
        ];
      },
      [elementsRef.current]
    );

    const unregister = useCallback(
      (elementId: string) => {
        elementsRef.current = elementsRef.current.filter(
          ({ id }) => id !== elementId
        );
      },
      [elementsRef.current]
    );

    const focus = useCallback(
      (elementId: string) => {
        const elementRef = elementsRef.current.find(
          ({ id }) => id === elementId
        );
        if (elementRef && elementRef.ref && elementRef.ref.current) {
          console.debug('imperatively focusing ', elementRef.ref.current);
          elementRef.ref.current.focus();
        } else {
          console.debug(
            `Tried to focus element ${elementId}, but it was not found in focus group${
              groupName ? ` "${groupName}"` : ''
            }`
          );
        }
      },
      [elementsRef]
    );

    const renderProps = {
      ref,
    };

    return (
      <FocusContext.Provider
        {...rest}
        value={{
          register,
          unregister,
          focus,
          id: groupName || null,
        }}
      >
        {children(renderProps)}
      </FocusContext.Provider>
    );
  }
);

export const useImperativeFocus = () => {
  const focusContext = useContext(FocusContext);

  return focusContext.focus;
};
