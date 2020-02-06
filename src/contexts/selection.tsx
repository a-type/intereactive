import React, {
  createContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  ReactElement,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { getNextIndex, getPreviousIndex, walkSubtree } from '../utils';
import { INDEX_DATA_ATTRIBUTE, KEY_DATA_ATTRIBUTE } from '../constants';

export type SelectionContextValue = {
  onSelect: (key: string, value?: any) => any;
  goToNext: (key: string) => any;
  goToPrevious: (key: string) => any;
  selectedKey: string | null;
};

const SelectionContext = createContext<SelectionContextValue>({
  onSelect: () => {},
  goToNext: () => {},
  goToPrevious: () => {},
  selectedKey: null,
});

export default SelectionContext;

export interface SelectionContextProviderProps {
  noWrap?: boolean;
  observeDeep?: boolean;
  itemCount?: number;
  value?: string;
  onChange: (value: string) => any;
  children: (props: SelectionContextProviderRenderProps) => ReactElement;
  axis?: 'vertical' | 'horizontal' | 'both';
}

export interface SelectionContextProviderRenderProps {
  props: {
    ref: any; // TODO
  };
  isFocusWithinContainer: boolean;
}

export const SelectionProvider = forwardRef<
  { selectItem: (index: number) => void },
  SelectionContextProviderProps
>(
  (
    {
      noWrap,
      children,
      onChange,
      observeDeep,
      itemCount,
      axis = 'vertical',
      value,
      ...rest
    },
    ref
  ) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectableOrder, setSelectableOrder] = useState<string[]>([]);

    const { current: selectableElements } = useRef<{
      [key: string]: HTMLElement;
    }>({});
    const rescan = useCallback(
      (container: HTMLElement) => {
        const newSelectableOrder: string[] = [];
        walkSubtree(container, el => {
          const key = getElementKey(el);
          // user can specify an index manually, like for virtualized lists
          const index = getElementIndex(el);
          if (key) {
            if (index) {
              newSelectableOrder[index] = key;
            } else {
              newSelectableOrder.push(key);
            }
            selectableElements[key] = el as HTMLElement;
          }
        });
        setSelectableOrder(newSelectableOrder);
        const newSelectedIndex = Math.min(
          itemCount || newSelectableOrder.length,
          selectedIndex
        );
        setSelectedIndex(newSelectedIndex);
      },
      [selectedIndex, itemCount]
    );
    // static reference to a mutation observer
    const childObserverRef = useRef<MutationObserver | null>(
      new MutationObserver(mutations => {
        rescan(mutations[0].target as HTMLElement);
      })
    );
    const internalContainerRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      childObserverRef.current = new MutationObserver(() => {
        if (internalContainerRef.current) {
          rescan(internalContainerRef.current);
        }
      });
      if (internalContainerRef.current) {
        childObserverRef.current.observe(internalContainerRef.current, {
          childList: true,
          subtree: observeDeep,
        });
      }
      return () => {
        childObserverRef.current && childObserverRef.current.disconnect();
      };
    }, [rescan, internalContainerRef, observeDeep]);

    const [isFocusWithinContainer, setIsFocusWithinContainer] = useState(false);

    const containerRef = useCallback(
      (el: HTMLElement) => {
        internalContainerRef.current = el;
        const { current: childObserver } = childObserverRef;
        if (el === null) {
          // clear any previous observation
          childObserver && childObserver.disconnect();
          setIsFocusWithinContainer(false);
        } else {
          rescan(el); // do an initial scan
          childObserver &&
            childObserver.observe(el, {
              childList: true,
              subtree: observeDeep,
            });
          el.addEventListener('focusin', () => {
            setIsFocusWithinContainer(true);
          });
          el.addEventListener('focusout', () => {
            setIsFocusWithinContainer(false);
          });
        }
      },
      [childObserverRef, observeDeep, setIsFocusWithinContainer]
    );

    const findElementIndex = useCallback(
      (searchKey: string) => {
        return selectableOrder.indexOf(searchKey);
      },
      [selectableOrder]
    );

    const getElement = useCallback(
      (index: number) => {
        const key = selectableOrder[index];
        if (!key) return null;
        const el = selectableElements[key];
        return el || null;
      },
      [selectableOrder, selectableElements]
    );

    useEffect(() => {
      const idx = value !== undefined ? findElementIndex(value) : 0;
      setSelectedIndex(idx);
    }, [value, findElementIndex]);

    const goToNext = useCallback(() => {
      // naive, doesn't use key
      const newIndex = getNextIndex(
        selectedIndex,
        itemCount || selectableOrder.length,
        !noWrap
      );
      setSelectedIndex(newIndex);
      const el = getElement(newIndex);
      if (!el) {
        console.warn(
          `Index ${newIndex} was selected, but no element registered`
        );
        return;
      }
      el.focus();
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, [selectedIndex, itemCount, selectableOrder, noWrap]);

    const goToPrevious = useCallback(() => {
      // naive, doesn't use key
      const newIndex = getPreviousIndex(
        selectedIndex,
        itemCount || selectableOrder.length,
        !noWrap
      );
      setSelectedIndex(newIndex);
      const el = getElement(newIndex);
      if (!el) {
        console.warn(
          `Index ${newIndex} was selected, but no element registered`
        );
        return;
      }
      el.focus();
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, [selectedIndex, itemCount, selectableOrder, noWrap]);

    const onSelect = useCallback(
      (key: string, value?: any) => {
        setSelectedIndex(findElementIndex(key));
        onChange(value);
      },
      [setSelectedIndex, findElementIndex, onChange]
    );

    const selectedKey = useMemo(() => {
      const key = selectableOrder[selectedIndex];
      return key || selectableOrder[0];
    }, [selectableOrder, selectedIndex]);

    useImperativeHandle(ref, () => ({
      selectItem: (index = 0) => setSelectedIndex(index),
    }));

    const renderProps = {
      props: {
        ref: containerRef,
      },
      isFocusWithinContainer,
    };

    return (
      <SelectionContext.Provider
        value={{ onSelect, selectedKey, goToNext, goToPrevious }}
        {...rest}
      >
        {children(renderProps)}
      </SelectionContext.Provider>
    );
  }
);

const getElementKey = (node: Node) => {
  if (node.nodeType === node.ELEMENT_NODE) {
    return (node as Element).getAttribute(KEY_DATA_ATTRIBUTE) || null;
  }
  return null;
};

const getElementIndex = (node: Node) => {
  if (node.nodeType === node.ELEMENT_NODE) {
    const indexString =
      (node as Element).getAttribute(INDEX_DATA_ATTRIBUTE) || null;
    return parseInt(indexString || '', 10) || null;
  }
  return null;
};
