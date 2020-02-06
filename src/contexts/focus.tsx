/** @category Focus */

import React, {
  createContext,
  RefObject,
  useCallback,
  Ref,
  useRef,
  useEffect,
  forwardRef,
  ElementType,
  HTMLAttributes,
} from 'react';
import { useCombinedRefs } from '../utils';

export type FocusContextValue = {
  /** registers an element as available for focus control */
  register(elementId: string, elementRef: RefObject<HTMLElement>): void;
  /** unregisters an element as available for focus control */
  unregister(elementId: string): void;
  /** imperatively focuses an element by id */
  focus(elementId: string): void;
};

export const FocusContext = createContext<FocusContextValue>({
  register: () => {},
  unregister: () => {},
  focus: () => {},
});

export type FocusProviderProps<P = HTMLAttributes<HTMLDivElement>> = {
  /** optional group name to make debugging easier */
  groupName?: string;
  /** enable trapping focus within this container */
  trapFocus?: boolean;
  /** override the component used to render the container element */
  component?: ElementType<P>;
} & P;

/**
 * A FocusContainer wraps focusable elements, allowing you to trap focus
 * or imperatively focus specific components.
 *
 * @category Focus
 */
export const FocusContainer = forwardRef<any, FocusProviderProps>(
  (
    {
      groupName,
      trapFocus,
      children,
      component: CustomComponent = 'div',
      ...rest
    },
    providedRef
  ) => {
    const elementsRef = useRef<
      { id: string; ref: RefObject<HTMLElement> | null }[]
    >([]);

    const internalRef = useRef(null);
    const ref = useCombinedRefs(internalRef, providedRef);
    const lastFocusedRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (!internalRef || !trapFocus) {
        return;
      }

      const container =
        internalRef.current ||
        (typeof children !== 'function' ? document : null);

      if (!container) {
        return;
      }

      const trapFocusInside = (ev: Event) => {
        const target = ev.target as HTMLElement;
        if (container.contains(target)) {
          lastFocusedRef.current = target;
          return;
        }

        const firstFocusable = elementsRef.current[0];
        const firstFocusableElement =
          firstFocusable && firstFocusable.ref && firstFocusable.ref.current;

        // the previous focused element before this move was the first
        // one inside the trap, which implies the user moved backward outside
        // the trap, so we should move focus to wrap to the last item.
        // TODO: consider case with only one item.
        if (lastFocusedRef.current === firstFocusableElement) {
          const lastFocusable =
            elementsRef.current[elementsRef.current.length - 1];
          const lastFocusableElement =
            lastFocusable && lastFocusable.ref && lastFocusable.ref.current;
          if (lastFocusableElement) {
            lastFocusableElement.focus();
            lastFocusedRef.current = lastFocusableElement;
            ev.preventDefault();
          }
        } else {
          // this is covered using the focus sentinel
          return;
        }
      };

      document.addEventListener('focusin', trapFocusInside);
      return () => document.removeEventListener('focusin', trapFocusInside);
    }, [internalRef, trapFocus]);

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
      [elementsRef]
    );

    const unregister = useCallback(
      (elementId: string) => {
        elementsRef.current = elementsRef.current.filter(
          ({ id }) => id !== elementId
        );
      },
      [elementsRef]
    );

    const focus = useCallback(
      (elementId: string) => {
        const elementRef = elementsRef.current.find(
          ({ id }) => id === elementId
        );
        if (elementRef && elementRef.ref && elementRef.ref.current) {
          elementRef.ref.current.focus();
        } else {
          console.warn(
            `Tried to focus element ${elementId}, but it was not found in focus group${
              groupName ? ` "${groupName}"` : ''
            }. Focusable elements are: ${elementsRef.current
              .map(({ id }) => id)
              .join(', ')}`
          );
        }
      },
      [elementsRef]
    );

    const onFocusSentinelFocus = useCallback(() => {
      const activeFocusables = elementsRef.current.filter(({ ref }) => !!ref);
      const firstFocusable = activeFocusables[0];
      if (!firstFocusable || !firstFocusable.ref?.current) {
        console.warn(
          `Focus trap detected focus reached barrier, but no focusable elements are registered to move focus to`
        );
        return;
      }

      firstFocusable.ref?.current.focus();
    }, [elementsRef]);

    return (
      <FocusContext.Provider
        value={{
          register,
          unregister,
          focus,
        }}
      >
        {/*  multiline comment format required for prettier and ts to work in jsx.
          this props signature is too complex for TS due to the overridable nature.
        // @ts-ignore */ /* prettier-ignore */}
        <CustomComponent ref={ref} {...rest}>
          {children}
          {trapFocus && (
            <div
              tabIndex={0}
              className="interreactive-focus-trap-sentinel"
              onFocus={onFocusSentinelFocus}
            />
          )}
        </CustomComponent>
      </FocusContext.Provider>
    );
  }
);
