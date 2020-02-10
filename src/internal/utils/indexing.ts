import { DeepOrderingNode, DeepIndex } from './types';
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

export const resolveIndexLocation = (
  ordering: DeepOrderingNode,
  index: DeepIndex
): DeepOrderingNode => {
  if (index.length === 0) {
    return ordering;
  } else {
    const [firstLevel, ...rest] = index;
    return resolveIndexLocation(ordering.children[firstLevel], rest);
  }
};

/**
 * Cycles a deep index to the next sibling. It's not possible to "escape"
 * a sibling group with a horizontal move like this. If there are a couple
 * sibling elements, it will move to the next one (with or without wrap).
 * If there's only 1, it won't do anything.
 */
export const getNextDeepIndex = (
  currentIndex: DeepIndex,
  ordering: DeepOrderingNode,
  wrap?: boolean
): DeepIndex => {
  const prefixIndices = getUpwardDeepIndex(currentIndex);
  const parent = resolveIndexLocation(ordering, prefixIndices);
  const operantIndexValue = getNextIndex(
    currentIndex[currentIndex.length - 1],
    parent.children.length,
    wrap
  );
  return [...prefixIndices, operantIndexValue];
};

/**
 * Cycles a deep index to the previous sibling. It's not possible to "escape"
 * a sibling group with a horizontal move like this. If there are a couple
 * sibling elements, it will move to the previous one (with or without wrap).
 * If there's only 1, it won't do anything.
 */
export const getPreviousDeepIndex = (
  currentIndex: DeepIndex,
  ordering: DeepOrderingNode,
  wrap?: boolean
): DeepIndex => {
  const prefixIndices = getUpwardDeepIndex(currentIndex);
  const parent = resolveIndexLocation(ordering, prefixIndices);
  const operantIndexValue = getPreviousIndex(
    currentIndex[currentIndex.length - 1],
    parent.children.length,
    wrap
  );
  return [...prefixIndices, operantIndexValue];
};

/**
 * A simple upward traversal, selecting the previously selected parent
 * index
 */
export const getUpwardDeepIndex = (currentIndex: DeepIndex): DeepIndex => {
  return currentIndex.slice(0, currentIndex.length - 1);
};

/**
 * Traverses downward if there's a child grouping, selecting the first
 * index in the children.
 */
export const getDownwardDeepIndex = (
  currentIndex: DeepIndex,
  ordering: DeepOrderingNode
): DeepIndex => {
  const current = resolveIndexLocation(ordering, currentIndex);
  if (!current.children.length) {
    return currentIndex;
  }
  return [...currentIndex, 0];
};

/**
 * Gets the closes valid index to a supplied deep index for
 * the given ordering tree. Closeness is evaluated from
 * root down, so if
 */
export const getClosestValidDeepIndex = (
  prospectiveIndex: DeepIndex,
  ordering: DeepOrderingNode
): DeepIndex =>
  prospectiveIndex.reduce<DeepIndex>((rebuiltIndex, nextPosition) => {
    const level = resolveIndexLocation(ordering, rebuiltIndex);
    if (!level.children.length) {
      // reached a point where the index specifies a position,
      // but the children are empty, so we "cut off" the index at
      // its current place
      return rebuiltIndex;
    } else {
      // otherwise, try to get close to the provided position,
      // but stop at the end of the children list.
      return rebuiltIndex.concat(Math.min(level.children.length, nextPosition));
    }
  }, []);
