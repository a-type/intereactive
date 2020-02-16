import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  getClosestValidDeepIndex,
  resolveIndexLocation,
  getOffsetDeepIndex,
  getUpwardDeepIndex,
  getDownwardDeepIndex,
} from './indexing';
import {
  getElementKey,
  isElementRow,
  getElementManualCoordinates,
} from './attributes';
import { DeepOrderingNode, DeepIndex } from './types';
import { isHtmlElement } from './guards';
import { isElementDisabled } from './attributes';
import {
  PARENT_CONTAINER_ATTRIBUTE,
  INITIAL_INDEX,
  KEY_DATA_ATTRIBUTE,
  DISABLED_ATTRIBUTE,
  X_INDEX_DATA_ATTRIBUTE,
  Y_INDEX_DATA_ATTRIBUTE,
  ROW_CONTAINER_ATTRIBUTE,
} from '../constants';

type ElementMap = {
  [key: string]: {
    element: HTMLElement;
    index: DeepIndex;
  };
};

type OrderingDiscoveryContext = {
  crossContainerBoundaries?: boolean;
  parentIndex: DeepIndex;
  crossAxisRowPosition: number;
};
/**
 * Mutates a master DeepOrderingNode tree and ElementMap. Traverses
 * the DOM tree and fills in the parallel DeepOrdering tree, and
 * documents the key lookup for each item element.
 */
export const discoverOrderingStructure = (
  parent: DeepOrderingNode,
  elementMap: ElementMap,
  root: Node,
  {
    crossContainerBoundaries,
    parentIndex,
    crossAxisRowPosition,
  }: OrderingDiscoveryContext = {
    parentIndex: [],
    crossAxisRowPosition: 0,
  }
): void => {
  // parent ordering node represents the root node.
  // assume root node has already been processed.

  let currentCrossAxisRowPosition = crossAxisRowPosition;

  root.childNodes.forEach(node => {
    // bail if text node or other non-html node
    if (!isHtmlElement(node)) {
      return;
    }

    // bail if reaching a child container (indicated by attr)
    // and cross container boundaries is false
    if (
      !crossContainerBoundaries &&
      node.hasAttribute(PARENT_CONTAINER_ATTRIBUTE)
    ) {
      return;
    }

    // check if child is a selectable item
    const key = getElementKey(node);

    if (key) {
      // the user may specify manual coordinates for an element. this allows them
      // to place the element anywhere within the 2d grid of children of the parent
      // node context. the user can't today specify a "z" coordinate (i.e. break out
      // of the natural DOM inheritance structure and put a child element above or
      // beside its parent in ordering)
      const [
        manualXCoordinate,
        manualYCoordinate,
      ] = getElementManualCoordinates(node);

      // resolve the final coordinates
      const finalY = manualYCoordinate ?? currentCrossAxisRowPosition;
      if (!parent.children[finalY]) {
        parent.children[finalY] = [];
      }
      const naturalX = parent.children[finalY].length;
      const finalX = manualXCoordinate ?? naturalX;

      const childIndex: DeepIndex = [...parentIndex, [finalX, finalY]];

      elementMap[key] = {
        element: node,
        index: childIndex,
      };

      const newOrderingNode = {
        key,
        disabled: isElementDisabled(node),
        children: [],
      };

      discoverOrderingStructure(newOrderingNode, elementMap, node, {
        parentIndex: childIndex,
        crossAxisRowPosition: 0,
        crossContainerBoundaries,
      });
      parent.children[finalY][finalX] = newOrderingNode;
    } else {
      // if not, continue traversing downward...
      // kind of a 'skip level'
      discoverOrderingStructure(parent, elementMap, node, {
        parentIndex,
        crossAxisRowPosition: currentCrossAxisRowPosition,
        crossContainerBoundaries,
      });

      if (isElementRow(node)) {
        currentCrossAxisRowPosition = currentCrossAxisRowPosition + 1;
      }
    }
  });
};

export const useSelectableChildren = ({
  observeDeep,
  itemCount,
  wrap,
  crossContainerBoundaries,
  initialSelectedIndex = INITIAL_INDEX,
  onMove,
}: {
  observeDeep?: boolean;
  itemCount?: number;
  wrap?: boolean;
  crossContainerBoundaries?: boolean;
  initialSelectedIndex?: DeepIndex;
  onMove?: (element: HTMLElement | null, key: string, index: DeepIndex) => void;
} = {}) => {
  const elementKeyMapRef = useRef<ElementMap>({});
  const [selectionDeepIndex, setSelectionDeepIndex] = useState<DeepIndex>(
    initialSelectedIndex
  );
  const [deepOrderingTree, setDeepOrderingTree] = useState<DeepOrderingNode>({
    key: null,
    children: [],
    disabled: false,
  });

  const rescan = useCallback(
    (container: HTMLElement) => {
      const newOrdering: DeepOrderingNode = {
        key: null,
        children: [],
        disabled: false,
      };
      const newElementMap: ElementMap = {};

      discoverOrderingStructure(newOrdering, newElementMap, container, {
        crossContainerBoundaries,
        parentIndex: [],
        crossAxisRowPosition: 0,
      });

      setDeepOrderingTree(newOrdering);
      elementKeyMapRef.current = newElementMap;

      const newSelectedDeepIndex = getClosestValidDeepIndex(
        selectionDeepIndex,
        newOrdering
      );

      setSelectionDeepIndex(newSelectedDeepIndex);
    },
    [selectionDeepIndex, setSelectionDeepIndex, setDeepOrderingTree]
  );

  // static reference to a mutation observer
  const childObserverRef = useRef<MutationObserver | null>(null);

  const internalContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    childObserverRef.current = new MutationObserver(() => {
      if (internalContainerRef.current) {
        rescan(internalContainerRef.current);
      }
    });
    if (internalContainerRef.current) {
      childObserverRef.current.observe(internalContainerRef.current, {
        // observe changes to child dom structure
        childList: true,
        // observe the full subtree
        subtree: observeDeep,
        // observe attribute changes...
        attributes: true,
        // ...for these attributes only
        attributeFilter: [
          KEY_DATA_ATTRIBUTE,
          DISABLED_ATTRIBUTE,
          X_INDEX_DATA_ATTRIBUTE,
          Y_INDEX_DATA_ATTRIBUTE,
          ROW_CONTAINER_ATTRIBUTE,
        ],
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
      return elementKeyMapRef.current[searchKey]?.index ?? null;
    },
    [elementKeyMapRef]
  );

  const getElementInfo = useCallback(
    (searchKey: string) => elementKeyMapRef.current[searchKey],
    [elementKeyMapRef]
  );

  const getKeyFromIndex = useCallback(
    (index: DeepIndex) => {
      const orderingNode = resolveIndexLocation(deepOrderingTree, index);
      if (!orderingNode || !orderingNode.key) return null;
      return orderingNode.key;
    },
    [deepOrderingTree]
  );

  const getElement = useCallback(
    (index: DeepIndex) => {
      const key = getKeyFromIndex(index);
      if (!key) return null;
      const lookup = elementKeyMapRef.current[key];
      return lookup.element || null;
    },
    [getKeyFromIndex, elementKeyMapRef]
  );

  const setSelection = useCallback(
    (
      indexOrUpdater: DeepIndex | ((current: DeepIndex) => DeepIndex),
      isMove?: boolean
    ) => {
      if (indexOrUpdater === null) debugger;
      // FIXME: evaluate if a setter fn with side-effects is a terrible idea
      setSelectionDeepIndex(current => {
        const index =
          typeof indexOrUpdater === 'function'
            ? indexOrUpdater(current)
            : indexOrUpdater;
        if (index.length === 0) {
          return index;
        }
        const orderingNode = resolveIndexLocation(deepOrderingTree, index);
        if (!orderingNode?.key) {
          console.warn(
            `Set selection to index ${JSON.stringify(
              index
            )}, but no item was discovered at that position`
          );
          return index;
        }
        const lookup = elementKeyMapRef.current[orderingNode.key];
        if (isMove) {
          onMove && onMove(lookup.element, orderingNode.key, index);
        }

        return index;
      });
    },
    [deepOrderingTree, elementKeyMapRef, onMove]
  );

  const finalItemCount =
    itemCount !== undefined
      ? itemCount
      : Object.keys(elementKeyMapRef.current || {}).length;

  const goToNext = useCallback(() => {
    setSelection(
      current => getOffsetDeepIndex(current, deepOrderingTree, 'next', wrap),
      true
    );
  }, [setSelection, deepOrderingTree, wrap]);

  const goToPrevious = useCallback(() => {
    setSelection(
      current =>
        getOffsetDeepIndex(current, deepOrderingTree, 'previous', wrap),
      true
    );
  }, [setSelection, deepOrderingTree, wrap]);

  const goToNextOrthogonal = useCallback(() => {
    setSelection(
      current =>
        getOffsetDeepIndex(current, deepOrderingTree, 'nextOrthogonal', wrap),
      true
    );
  }, [setSelection, deepOrderingTree, wrap]);

  const goToPreviousOrthogonal = useCallback(() => {
    setSelection(
      current =>
        getOffsetDeepIndex(
          current,
          deepOrderingTree,
          'previousOrthogonal',
          wrap
        ),
      true
    );
  }, [setSelection, deepOrderingTree, wrap]);

  const goUp = useCallback(() => {
    setSelection(
      current => getUpwardDeepIndex(current, deepOrderingTree),
      true
    );
  }, [setSelection, deepOrderingTree]);

  const goDown = useCallback(() => {
    setSelection(
      current => getDownwardDeepIndex(current, deepOrderingTree),
      true
    );
  }, [setSelection, deepOrderingTree]);

  // lookup the selected item key based on the index
  const selectedKey = useMemo(() => getKeyFromIndex(selectionDeepIndex), [
    getKeyFromIndex,
    selectionDeepIndex,
  ]);

  return {
    handleContainerElement,
    selectionDeepIndex,
    findElementIndex,
    getElement,
    itemCount: finalItemCount,
    goToNext,
    goToPrevious,
    goToNextOrthogonal,
    goToPreviousOrthogonal,
    goUp,
    goDown,
    setSelectionDeepIndex: setSelection,
    selectedKey,
    getElementInfo,
  };
};
