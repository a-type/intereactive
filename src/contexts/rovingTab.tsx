import React, {
  createContext,
  useCallback,
  useEffect,
  HTMLAttributes,
  ElementType,
  forwardRef,
} from 'react';
import { useSelectableChildren, useCombinedRefs } from '../internal/utils';

export type RovingTabContextValue = {
  onSelect: (key: string, value?: any) => any;
  goToNext: (key: string) => any;
  goToPrevious: (key: string) => any;
  selectedKey: string | null;
};

const RovingTabContext = createContext<RovingTabContextValue>({
  onSelect: () => {},
  goToNext: () => {},
  goToPrevious: () => {},
  selectedKey: null,
});

export default RovingTabContext;

type BaseRovingTabContainerProps<P> = {
  noWrap?: boolean;
  observeDeep?: boolean;
  itemCount?: number;
  value?: string;
  onChange: (value: string) => any;
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

    const containerRef = useCallback(
      (el: HTMLElement | null) => {
        handleContainerElement(el);
      },
      [handleContainerElement]
    );
    const finalRef = useCombinedRefs(containerRef, ref);

    // when the controlled value changes, update the selected index to match
    useEffect(() => {
      const idx = value !== undefined ? findElementIndex(value) : 0;
      setSelectedIndex(idx);
    }, [value, findElementIndex]);

    // respond to changes in selected index to focus the new element.
    // the actual roving tabindex is handled in the hook.
    useEffect(() => {
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
        onChange(value);
      },
      [setSelectedIndex, findElementIndex, onChange]
    );

    return (
      <RovingTabContext.Provider
        value={{ onSelect, selectedKey, goToNext, goToPrevious }}
        {...rest}
      >
        {/*  multiline comment format required for prettier and ts to work in jsx.
          this props signature is too complex for TS due to the overridable nature.
        // @ts-ignore */ /* prettier-ignore */}
        <CustomComponent ref={finalRef} {...rest}>
        {children}
      </CustomComponent>
      </RovingTabContext.Provider>
    );
  }
);
