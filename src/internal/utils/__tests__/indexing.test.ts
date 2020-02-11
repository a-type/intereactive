import { getClosestValidDeepIndex } from '../indexing';
import {
  getOffsetDeepIndex,
  getUpwardDeepIndex,
  getDownwardDeepIndex,
} from '../indexing';

const basicFlatStructure = {
  key: null,
  children: [
    [
      {
        key: 'a',
        children: [],
      },
      {
        key: 'b',
        children: [],
      },
    ],
  ],
};

const basicNestedStructure = {
  key: null,
  children: [
    [
      {
        key: 'a',
        children: [
          [
            {
              key: 'i',
              children: [],
            },
            {
              key: 'ii',
              children: [],
            },
          ],
        ],
      },
      {
        key: 'b',
        children: [
          [
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
        ],
      },
    ],
  ],
};

const basic3dStructure = {
  key: null,
  children: [
    [
      {
        key: 'a1',
        children: [
          [
            {
              key: 'a1i',
              children: [],
            },
            {
              key: 'a1ii',
              children: [],
            },
          ],
          [
            {
              key: 'a1j',
              children: [],
            },
            {
              key: 'a1jj',
              children: [],
            },
          ],
        ],
      },
      {
        key: 'a2',
        children: [
          [
            {
              key: 'a2i',
              children: [],
            },
            {
              key: 'a2ii',
              children: [
                [
                  {
                    key: 'a2iiX',
                    children: [],
                  },
                ],
              ],
            },
          ],
        ],
      },
    ],
    [
      {
        key: 'b1',
        children: [
          [
            {
              key: 'b1i',
              children: [],
            },
            {
              key: 'b1ii',
              children: [],
            },
          ],
          [
            {
              key: 'b1j',
              children: [],
            },
          ],
        ],
      },
      {
        key: 'b2',
        children: [],
      },
    ],
  ],
};

describe('indexing utils', () => {
  describe('2d indexing', () => {
    describe('get offset deep index', () => {
      test('advances in a flat structure', () => {
        expect(
          getOffsetDeepIndex([[0, 0]], basicFlatStructure, [1, 0])
        ).toEqual([[1, 0]]);
      });

      test('wraps', () => {
        expect(
          getOffsetDeepIndex([[1, 0]], basicFlatStructure, [1, 0], true)
        ).toEqual([[0, 0]]);
      });

      test("doesn't advance past end when wrap = false", () => {
        expect(
          getOffsetDeepIndex([[1, 0]], basicFlatStructure, [1, 0])
        ).toEqual([[1, 0]]);
      });

      test('goes back in a flat structure', () => {
        expect(
          getOffsetDeepIndex([[1, 0]], basicFlatStructure, [-1, 0])
        ).toEqual([[0, 0]]);
      });

      test("doesn't go back past end when wrap = false", () => {
        expect(
          getOffsetDeepIndex([[0, 0]], basicFlatStructure, [-1, 0])
        ).toEqual([[0, 0]]);
      });

      test('ignores nested items', () => {
        expect(
          getOffsetDeepIndex([[0, 0]], basicNestedStructure, [1, 0])
        ).toEqual([[1, 0]]);
      });
    });

    describe('get upward deep index', () => {
      test('goes upward', () => {
        expect(
          getUpwardDeepIndex([
            [0, 0],
            [1, 0],
          ])
        ).toEqual([[0, 0]]);
      });
      test("doesn't go up too far", () => {
        expect(getUpwardDeepIndex([[1, 0]])).toEqual([[1, 0]]);
      });
    });

    describe('get downward deep index', () => {
      test('goes downward', () => {
        expect(getDownwardDeepIndex([[1, 0]], basicNestedStructure)).toEqual([
          [1, 0],
          [0, 0],
        ]);
      });

      test("stops when there's no where to go", () => {
        expect(
          getDownwardDeepIndex(
            [
              [0, 0],
              [1, 0],
            ],
            basicNestedStructure
          )
        ).toEqual([
          [0, 0],
          [1, 0],
        ]);
      });
    });

    describe('get closest valid deep index', () => {
      test('resolves the same index when valid', () => {
        expect(
          getClosestValidDeepIndex(
            [
              [1, 0],
              [1, 0],
              [0, 0],
            ],
            basicNestedStructure
          )
        ).toEqual([
          [1, 0],
          [1, 0],
          [0, 0],
        ]);
        expect(
          getClosestValidDeepIndex(
            [
              [1, 0],
              [1, 0],
            ],
            basicNestedStructure
          )
        ).toEqual([
          [1, 0],
          [1, 0],
        ]);
        expect(
          getClosestValidDeepIndex([[1, 0]], basicNestedStructure)
        ).toEqual([[1, 0]]);
      });

      test('resolves an empty index', () => {
        expect(getClosestValidDeepIndex([], basicNestedStructure)).toEqual([]);
      });

      test('finds a close sibling', () => {
        expect(
          getClosestValidDeepIndex(
            [
              [1, 0],
              [1, 0],
              [3, 0],
            ],
            basicNestedStructure
          )
        ).toEqual([
          [1, 0],
          [1, 0],
          [0, 0],
        ]);
      });

      test('goes up to a parent if no siblings', () => {
        expect(
          getClosestValidDeepIndex(
            [
              [0, 0],
              [1, 0],
              [1, 0],
            ],
            basicNestedStructure
          )
        ).toEqual([
          [0, 0],
          [1, 0],
        ]);
      });

      test("goes all the way up if there's no nesting", () => {
        expect(
          getClosestValidDeepIndex(
            [
              [1, 0],
              [2, 0],
              [3, 0],
              [4, 0],
              [5, 0],
            ],
            basicFlatStructure
          )
        ).toEqual([[1, 0]]);
      });
    });
  });

  describe('3d indexing', () => {
    describe('get offset deep index', () => {
      test('moves forward orthogonally', () => {
        expect(getOffsetDeepIndex([[0, 0]], basic3dStructure, [0, 1])).toEqual([
          [0, 1],
        ]);
      });

      test('wraps orthogonally', () => {
        expect(
          getOffsetDeepIndex([[0, 1]], basic3dStructure, [0, 1], true)
        ).toEqual([[0, 0]]);
      });

      test('wraps in a deep structure orthogonally, preserving main axis value', () => {
        expect(
          getOffsetDeepIndex(
            [
              [0, 0],
              [1, 1],
            ],
            basic3dStructure,
            [0, 1],
            true
          )
        ).toEqual([
          [0, 0],
          [1, 0],
        ]);
      });
    });
  });
});
