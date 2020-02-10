import { getClosestValidDeepIndex } from '../indexing';
import {
  getOffsetDeepIndex,
  getUpwardDeepIndex,
  getDownwardDeepIndex,
} from '../indexing';

const basicFlatStructure = {
  key: null,
  children: [
    {
      key: 'a',
      children: [],
    },
    {
      key: 'b',
      children: [],
    },
  ],
};

const basicNestedStructure = {
  key: null,
  children: [
    {
      key: 'a',
      children: [
        {
          key: 'i',
          children: [],
        },
        {
          key: 'ii',
          children: [],
        },
      ],
    },
    {
      key: 'b',
      children: [
        {
          key: 'iii',
          children: [],
        },
        {
          key: 'iv',
          children: [
            {
              key: '1',
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

describe('indexing utils', () => {
  describe('get offset deep index', () => {
    test('advances in a flat structure', () => {
      expect(getOffsetDeepIndex([0], basicFlatStructure, 1)).toEqual([1]);
    });

    test("doesn't advance past end when wrap = false", () => {
      expect(getOffsetDeepIndex([1], basicFlatStructure, 1)).toEqual([1]);
    });

    test('goes back in a flat structure', () => {
      expect(getOffsetDeepIndex([1], basicFlatStructure, -1)).toEqual([0]);
    });

    test("doesn't go back past end when wrap = false", () => {
      expect(getOffsetDeepIndex([0], basicFlatStructure, -1)).toEqual([0]);
    });

    test('ignores nested items', () => {
      expect(getOffsetDeepIndex([0], basicNestedStructure, 1)).toEqual([1]);
    });
  });

  describe('get upward deep index', () => {
    test('goes upward', () => {
      expect(getUpwardDeepIndex([0, 1])).toEqual([0]);
    });
  });

  describe('get downward deep index', () => {
    test('goes downward', () => {
      expect(getDownwardDeepIndex([1], basicNestedStructure)).toEqual([1, 0]);
    });

    test("stops when there's no where to go", () => {
      expect(getDownwardDeepIndex([0, 1], basicNestedStructure)).toEqual([
        0,
        1,
      ]);
    });
  });

  describe('get closest valid deep index', () => {
    test('resolves the same index when valid', () => {
      expect(
        getClosestValidDeepIndex([1, 1, 0], basicNestedStructure)
      ).toEqual([1, 1, 0]);
      expect(getClosestValidDeepIndex([1, 1], basicNestedStructure)).toEqual([
        1,
        1,
      ]);
      expect(getClosestValidDeepIndex([1], basicNestedStructure)).toEqual([1]);
    });

    test('resolves an empty index', () => {
      expect(getClosestValidDeepIndex([], basicNestedStructure)).toEqual([]);
    });

    test('finds a close sibling', () => {
      expect(
        getClosestValidDeepIndex([1, 1, 3], basicNestedStructure)
      ).toEqual([1, 1, 0]);
    });

    test('goes up to a parent if no siblings', () => {
      expect(
        getClosestValidDeepIndex([0, 1, 1], basicNestedStructure)
      ).toEqual([0, 1]);
    });

    test("goes all the way up if there's no nesting", () => {
      expect(
        getClosestValidDeepIndex([1, 2, 3, 4, 5], basicFlatStructure)
      ).toEqual([1]);
    });
  });
});
