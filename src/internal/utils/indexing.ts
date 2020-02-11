import { DeepOrderingNode, DeepIndex } from './types';

export class InvalidIndexError extends Error {
  constructor(index: DeepIndex) {
    super(
      `Index ${JSON.stringify(
        index
      )} is not a valid position in the provided selectable element structure`
    );
  }
}

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
): DeepOrderingNode | null => {
  if (index.length === 0) {
    return ordering;
  } else {
    const [firstPosition, ...rest] = index;
    const [firstX, firstY] = firstPosition;

    if (!ordering.children[firstY] || !ordering.children[firstY][firstX]) {
      return null;
    }

    return resolveIndexLocation(
      // Y is indexed first since the conceptual model of the 2d children array
      // is rows stacked on top of one another
      //
      // [0, 1, 2, 3, 4, 5]
      // [6, 7, 8, 9, a, b]
      // [c, d, e, f, g, h]
      //
      // first we select which row (using Y) then the index in that row (X)
      ordering.children[firstY]?.[firstX] ?? null,
      rest
    );
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
  [offsetX, offsetY]: [-1 | 0 | 1, -1 | 0 | 1],
  wrap?: boolean
): DeepIndex => {
  const prefixIndices = currentIndex.slice(0, currentIndex.length - 1);
  const parent = resolveIndexLocation(ordering, prefixIndices);

  if (!parent) {
    throw new InvalidIndexError(currentIndex);
  }

  const operantCurrentPosition = currentIndex[currentIndex.length - 1];

  const operantYIndexValue = getOffsetIndex(
    operantCurrentPosition[1],
    parent.children.length,
    offsetY,
    wrap
  );
  const operantXIndexValue = getOffsetIndex(
    operantCurrentPosition[0],
    parent.children[operantYIndexValue].length,
    offsetX,
    wrap
  );
  return [...prefixIndices, [operantXIndexValue, operantYIndexValue]];
};

/**
 * A simple upward traversal, selecting the previously selected parent
 * index. It is assumed that your index is valid within your nested
 * structure.
 */
export const getUpwardDeepIndex = (currentIndex: DeepIndex): DeepIndex => {
  // don't go "up" to nothing
  if (currentIndex.length === 1) return currentIndex;
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

  if (!current) {
    throw new InvalidIndexError(currentIndex);
  }

  if (!current.children.length) {
    return currentIndex;
  }
  return [...currentIndex, [0, 0]];
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
  prospectiveIndex.reduce<DeepIndex>((rebuiltIndex, [nextX, nextY]) => {
    const level = resolveIndexLocation(ordering, rebuiltIndex);

    if (!level || !level.children.length) {
      // reached a point where the index specifies a position,
      // but the children are empty, so we "cut off" the index at
      // its current place
      return rebuiltIndex;
    } else {
      // otherwise, try to get close to the provided position,
      // but stop at the end of the children list.
      const closestY = Math.min(level.children.length - 1, nextY);
      const closestX = Math.min(level.children[closestY]?.length ?? 0, nextX);
      return [...rebuiltIndex, [closestX, closestY]];
    }
  }, []);
