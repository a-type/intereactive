import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  ReactElement,
  useMemo,
  forwardRef,
} from 'react';
import { useSelectableChildren } from '../utils';

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

export interface RovingTabContextProviderProps {
  noWrap?: boolean;
  observeDeep?: boolean;
  itemCount?: number;
  value?: string;
  onChange: (value: string) => any;
  children: (props: RovingTabContextProviderRenderProps) => ReactElement;
  axis?: 'vertical' | 'horizontal' | 'both';
}

export interface RovingTabContextProviderRenderProps {
  props: {
    ref: any; // TODO
  };
  isFocusWithinContainer: boolean;
}

export const RovingTabProvider = forwardRef<
  { selectItem: (index: number) => void },
  RovingTabContextProviderProps
>(
  ({
    noWrap,
    children,
    onChange,
    observeDeep,
    itemCount,
    axis = 'vertical',
    value,
    ...rest
  }) => {
    const {
      selectedIndex,
      selectableOrder,
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

    // track whether one of the children is currently focused, for convenience
    // and styling options.
    const [isFocusWithinContainer, setIsFocusWithinContainer] = useState(false);
    const containerRef = useCallback(
      (el: HTMLElement) => {
        handleContainerElement(el);
        if (el === null) {
          setIsFocusWithinContainer(false);
        } else {
          el.addEventListener('focusin', () => {
            setIsFocusWithinContainer(true);
          });
          el.addEventListener('focusout', () => {
            setIsFocusWithinContainer(false);
          });
        }
      },
      [setIsFocusWithinContainer]
    );

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

    // lookup the selected item key based on the index
    const selectedKey = useMemo(() => {
      const key = selectableOrder[selectedIndex];
      return key || selectableOrder[0];
    }, [selectableOrder, selectedIndex]);

    const renderProps = {
      props: {
        ref: containerRef,
      },
      isFocusWithinContainer,
    };

    return (
      <RovingTabContext.Provider
        value={{ onSelect, selectedKey, goToNext, goToPrevious }}
        {...rest}
      >
        {children(renderProps)}
      </RovingTabContext.Provider>
    );
  }
);
