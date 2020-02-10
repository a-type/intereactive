import React, {
  createContext,
  useCallback,
  useEffect,
  HTMLAttributes,
  ElementType,
  forwardRef,
  useContext,
  useRef,
} from 'react';
import {
  useSelectableChildren,
  useCombinedRefs,
  useIdOrGenerated,
} from '../internal/utils';
import { PARENT_CONTAINER_ATTRIBUTE } from '../internal/constants';

export type RovingTabContextValue = {
  onSelect: (key: string, value?: any) => any;
  goToNext: (key: string) => any;
  goToPrevious: (key: string) => any;
  goUp: () => any;
  goDown: () => any;
  activate: () => any;
  registerDescendant: (call: () => void) => void;
  unregisterDescendant: () => void;
  selectedKey: string | null;
  selectedIndex: number;
  getIndex: (key: string) => number;
  id: string | null;
};

const RovingTabContext = createContext<RovingTabContextValue>({
  onSelect: () => {},
  goToNext: () => {},
  goToPrevious: () => {},
  goUp: () => {},
  goDown: () => {},
  activate: () => {},
  registerDescendant: () => {},
  unregisterDescendant: () => {},
  selectedKey: null,
  selectedIndex: -1,
  getIndex: () => -1,
  id: null,
});

export default RovingTabContext;

type BaseRovingTabContainerProps<P> = {
  noWrap?: boolean;
  observeDeep?: boolean;
  itemCount?: number;
  value?: string;
  onChange?: (value: string) => any;
  /**
   * Override the component used to render the container element
   */
  component?: ElementType<P>;
};

export type RovingTabContainerProps<
  P = HTMLAttributes<HTMLDivElement>
> = BaseRovingTabContainerProps<P> &
  Omit<P, keyof BaseRovingTabContainerProps<P>>;

export const RovingTabContainer = forwardRef<any, RovingTabContainerProps>(
  (
    {
      noWrap,
      children,
      onChange,
      observeDeep,
      itemCount,
      value,
      component: CustomComponent = 'div',
      ...rest
    },
    ref
  ) => {
    const id = useIdOrGenerated(rest.id);

    const {
      selectedIndex,
      selectedKey,
      setSelectedIndex,
      goToNext,
      goToPrevious,
      findElementIndex,
      getElement,
      handleContainerElement,
    } = useSelectableChildren({
      observeDeep,
      itemCount,
    });

    const {
      registerDescendant: registerSelfAsDescendant,
      activate: activateParent,
      id: parentId,
    } = useContext(RovingTabContext);

    // register this context with any parent context.
    // if no parent exists, register will be a no-op
    const callThis = useCallback(() => {
      setSelectedIndex(0);
    }, [setSelectedIndex]);

    useEffect(() => {
      registerSelfAsDescendant(callThis);
      console.debug(`Registered ${id} as child of ${parentId}`);
    }, [registerSelfAsDescendant]);

    // setup a callback for descendants to register
    const callDescendantRef = useRef<() => void>(() => {});
    const registerDescendant = useCallback(
      callDescendant => {
        callDescendantRef.current = callDescendant;
      },
      [callDescendantRef]
    );
    const unregisterDescendant = useCallback(() => {
      callDescendantRef.current = () => {};
    }, [callDescendantRef]);

    const goUp = useCallback(() => {
      console.debug(`Going up from ${id}`);
      setSelectedIndex(-1);
      activateParent();
    }, [activateParent, setSelectedIndex]);
    const goDown = useCallback(() => {
      console.debug(`Going down from ${id}`);
      setSelectedIndex(-1);
      callDescendantRef.current();
    }, [callDescendantRef, setSelectedIndex]);

    // ref to the top level container element
    const containerRef = useCallback(
      (el: HTMLElement | null) => {
        handleContainerElement(el);
      },
      [handleContainerElement]
    );
    // combined with user ref, if provided
    const finalRef = useCombinedRefs(containerRef, ref);

    // when the controlled value changes, update the selected index to match
    useEffect(() => {
      const idx = value !== undefined ? findElementIndex(value) : -1;
      setSelectedIndex(idx);
    }, [value, findElementIndex]);

    // respond to changes in selected index to focus the new element.
    // the actual roving tabindex is handled in the hook.
    useEffect(() => {
      if (selectedIndex === -1) return;
      const el = getElement(selectedIndex);
      if (!el) {
        console.warn(
          `Index ${selectedIndex} was selected, but no element registered`
        );
        return;
      }
      el.focus();
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, [selectedIndex, getElement]);

    // when the user selects an item, force update the selected index
    // TODO: move this behavior to a focus handler in the hook?
    const onSelect = useCallback(
      (key: string, value?: any) => {
        setSelectedIndex(findElementIndex(key));
        onChange && onChange(value);
      },
      [setSelectedIndex, findElementIndex, onChange]
    );

    const contextValue: RovingTabContextValue = {
      onSelect,
      selectedKey,
      goToNext,
      goToPrevious,
      goUp,
      goDown,
      activate: callThis,
      registerDescendant,
      unregisterDescendant,
      selectedIndex,
      getIndex: findElementIndex,
      id,
    };

    const otherContainerProps = {
      [PARENT_CONTAINER_ATTRIBUTE]: true,
    };

    return (
      <RovingTabContext.Provider value={contextValue} {...rest}>
        {/*  multiline comment format required for prettier and ts to work in jsx.
          this props signature is too complex for TS due to the overridable nature.
        // @ts-ignore */ /* prettier-ignore */}
        <CustomComponent ref={finalRef} {...otherContainerProps} {...rest}>
        {children}
      </CustomComponent>
      </RovingTabContext.Provider>
    );
  }
);
