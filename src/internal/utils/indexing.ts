import { DeepOrderingNode, DeepIndex } from './types';

export const getOffsetIndex = (
  currentIndex: number,
  length: number,
  offset: number,
  wrap?: boolean
) => {
  let prospectiveNewIndex = currentIndex + offset;
  if (!wrap) {
    // clamp the value to available
    return Math.max(0, Math.min(length - 1, prospectiveNewIndex));
  }
  if (prospectiveNewIndex < 0) {
    prospectiveNewIndex += length;
  }
  while (prospectiveNewIndex >= length) {
    prospectiveNewIndex -= length;
  }

  return prospectiveNewIndex;
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
export const getOffsetDeepIndex = (
  currentIndex: DeepIndex,
  ordering: DeepOrderingNode,
  offset: 1 | -1, // only single jumps are currently supported due to complex structure
  wrap?: boolean
): DeepIndex => {
  const prefixIndices = getUpwardDeepIndex(currentIndex);
  const parent = resolveIndexLocation(ordering, prefixIndices);
  const operantIndexValue = getOffsetIndex(
    currentIndex[currentIndex.length - 1],
    parent.children.length,
    offset,
    wrap
  );
  return [...prefixIndices, operantIndexValue];
};

/**
 * A simple upward traversal, selecting the previously selected parent
 * index. It is assumed that your index is valid within your nested
 * structure.
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
      return rebuiltIndex.concat(
        Math.min(level.children.length - 1, nextPosition)
      );
    }
  }, []);
