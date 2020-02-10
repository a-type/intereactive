/** @external */
/**  */

import {
  useRef,
  Ref,
  useCallback,
  MutableRefObject,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { KeyCode } from './types';
import {
  KEY_DATA_ATTRIBUTE,
  INDEX_DATA_ATTRIBUTE,
  PARENT_CONTAINER_ATTRIBUTE,
} from './constants';
import { KeyActions, MovementAction } from '../keyActions';

export const generateId = (base?: string): string => {
  return `${base || 'generated'}-${Math.floor(Math.random() * 100000000)}`;
};

export const useRefOrProvided = <T extends any>(
  providedRef: Ref<T> | null | undefined
): Ref<T> => {
  const internalRef = useRef<T>(null);
  return providedRef || internalRef;
};

export const assignRef = <T>(ref: Ref<T>, el: T) => {
  if (typeof ref === 'function') {
    ref(el);
  } else {
    (ref as MutableRefObject<T>).current = el;
  }
};

export const useCombinedRefs = <T>(...refs: (Ref<T> | undefined)[]) => {
  const finalRef = useCallback((el: T) => {
    refs.forEach(ref => {
      if (ref) {
        assignRef(ref, el);
      }
    });
  }, refs);
  return finalRef;
};

export const useIdOrGenerated = (
  providedId?: string,
  idBase?: string
): string => {
  const generatedId = useRef<string>(generateId(idBase));
  if (providedId) {
    return providedId;
  } else {
    return generatedId.current;
  }
};

export const getNextIndex = (
  currentIndex: number,
  length: number,
  wrap?: boolean
) => {
  if (currentIndex + 1 < length) {
    return currentIndex + 1;
  }
  if (!wrap) {
    return length - 1;
  }
  return currentIndex + 1 - length;
};

export const getPreviousIndex = (
  currentIndex: number,
  length: number,
  wrap?: boolean
) => {
  if (currentIndex > 0) {
    return currentIndex - 1;
  }
  if (!wrap) {
    return 0;
  }
  return length + (currentIndex - 1);
};

export const getMovementAction = (keyActions: KeyActions, keyCode: KeyCode) => {
  switch (keyCode) {
    case KeyCode.ArrowUp:
      return keyActions.up;
    case KeyCode.ArrowDown:
      return keyActions.down;
    case KeyCode.ArrowLeft:
      return keyActions.left;
    case KeyCode.ArrowRight:
      return keyActions.right;
    default:
      return MovementAction.DoNothing;
  }
};

export const walkSubtree = (root: Node, visitor: (el: Node) => any) => {
  visitor(root);
  let child = root.firstChild;
  while (child) {
    walkSubtree(child, visitor);
    child = child.nextSibling;
  }
};

export const getElementKey = (node: Node) => {
  if (node.nodeType === node.ELEMENT_NODE) {
    return (node as Element).getAttribute(KEY_DATA_ATTRIBUTE) || null;
  }
  return null;
};

export const getElementIndex = (node: Node) => {
  if (node.nodeType === node.ELEMENT_NODE) {
    const indexString =
      (node as Element).getAttribute(INDEX_DATA_ATTRIBUTE) || null;
    return parseInt(indexString || '', 10) || null;
  }
  return null;
};

export const useSelectableChildren = ({
  observeDeep,
  itemCount,
  wrap,
}: { observeDeep?: boolean; itemCount?: number; wrap?: boolean } = {}) => {
  const { current: selectableElements } = useRef<{
    [key: string]: HTMLElement;
  }>({});
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectableOrder, setSelectableOrder] = useState<string[]>([]);

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
      setSelectedIndex(currentSelectedIndex =>
        currentSelectedIndex === -1 ? -1 : newSelectedIndex
      );
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

  const handleContainerElement = useCallback(
    (el: HTMLElement | null) => {
      internalContainerRef.current = el;
      const { current: childObserver } = childObserverRef;
      if (el === null) {
        // clear any previous observation
        childObserver && childObserver.disconnect();
      } else {
        rescan(el); // do an initial scan
        childObserver &&
          childObserver.observe(el, {
            childList: true,
            subtree: observeDeep,
          });
      }
    },
    [childObserverRef, observeDeep, internalContainerRef]
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

  const finalItemCount =
    itemCount !== undefined ? itemCount : selectableOrder.length;

  const goToNext = useCallback(() => {
    const newIndex = getNextIndex(selectedIndex, finalItemCount, wrap);
    setSelectedIndex(newIndex);
  }, [selectedIndex, setSelectedIndex, finalItemCount, wrap]);

  const goToPrevious = useCallback(() => {
    const newIndex = getPreviousIndex(selectedIndex, finalItemCount, wrap);
    setSelectedIndex(newIndex);
  }, [selectedIndex, setSelectedIndex, finalItemCount, wrap]);

  // lookup the selected item key based on the index
  const selectedKey = useMemo(() => {
    const key = selectableOrder[selectedIndex];
    return key || null;
  }, [selectableOrder, selectedIndex]);

  return {
    handleContainerElement,
    selectableOrder,
    selectableElements,
    selectedIndex,
    findElementIndex,
    getElement,
    itemCount: finalItemCount,
    goToNext,
    goToPrevious,
    setSelectedIndex,
    selectedKey,
  };
};
