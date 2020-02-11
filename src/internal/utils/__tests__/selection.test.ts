import {
  KEY_DATA_ATTRIBUTE,
  PARENT_CONTAINER_ATTRIBUTE,
  ROW_CONTAINER_ATTRIBUTE,
} from '../../constants';
import { discoverOrderingStructure } from '../selection';

describe('selection utils', () => {
  describe('discover ordering structure', () => {
    describe('can convert an example 2d DOM structure into correct tree ordering', () => {
      var parser = new DOMParser();
      var html = parser.parseFromString(
        `
        <div>
          <div ${KEY_DATA_ATTRIBUTE}="a">
            <div ${KEY_DATA_ATTRIBUTE}="a-i">
              <div ${KEY_DATA_ATTRIBUTE}="a-i-1"></div>
              <div ${PARENT_CONTAINER_ATTRIBUTE}>
                <div ${KEY_DATA_ATTRIBUTE}="childcontainer-1"></div>
              </div>
              <div ${KEY_DATA_ATTRIBUTE}="a-i-2"></div>
            </div>
            <div ${KEY_DATA_ATTRIBUTE}="a-ii"></div>
          </div>
          <div>
            <div ${KEY_DATA_ATTRIBUTE}="b">
              <div>
                <div ${KEY_DATA_ATTRIBUTE}="b-i"></div>
              </div>
            </div>
          </div>
        </div>
      `,
        'text/html'
      );

      test('ignoring sub-containers', () => {
        const tree = {
          key: null,
          children: [],
        };
        const elementMap: any = {};
        discoverOrderingStructure(tree, elementMap, html, {
          parentIndex: [],
          crossContainerBoundaries: false,
          crossAxisRowPosition: 0,
        });
        expect(tree).toEqual({
          children: [
            [
              {
                children: [
                  [
                    {
                      children: [
                        [
                          {
                            children: [],
                            key: 'a-i-1',
                          },
                          {
                            children: [],
                            key: 'a-i-2',
                          },
                        ],
                      ],
                      key: 'a-i',
                    },
                    {
                      children: [],
                      key: 'a-ii',
                    },
                  ],
                ],
                key: 'a',
              },
              {
                children: [
                  [
                    {
                      children: [],
                      key: 'b-i',
                    },
                  ],
                ],
                key: 'b',
              },
            ],
          ],
          key: null,
        });
        expect(Object.keys(elementMap).sort()).toEqual([
          'a',
          'a-i',
          'a-i-1',
          'a-i-2',
          'a-ii',
          'b',
          'b-i',
        ]);
        expect(elementMap['a-i-2'].index).toEqual([
          [0, 0],
          [0, 0],
          [1, 0],
        ]);
      });
    });

    describe.only('can convert an example 3d DOM structure into correct tree ordering', () => {
      var parser = new DOMParser();
      var html = parser.parseFromString(
        `
        <div>
          <div ${ROW_CONTAINER_ATTRIBUTE}>
            <div ${KEY_DATA_ATTRIBUTE}="a1">
              <div ${ROW_CONTAINER_ATTRIBUTE}>
                <div ${KEY_DATA_ATTRIBUTE}="a1-i">
                  <div ${KEY_DATA_ATTRIBUTE}="a1-i-1"></div>
                  <div ${PARENT_CONTAINER_ATTRIBUTE}>
                    <div ${KEY_DATA_ATTRIBUTE}="childcontainer-1"></div>
                  </div>
                  <div ${KEY_DATA_ATTRIBUTE}="a1-i-2"></div>
                </div>
                <div ${KEY_DATA_ATTRIBUTE}="a1-ii"></div>
              </div>
              <div ${ROW_CONTAINER_ATTRIBUTE}>
                <div ${KEY_DATA_ATTRIBUTE}="a1-j"></div>
                <div ${KEY_DATA_ATTRIBUTE}="a1-jj">
                  <div ${KEY_DATA_ATTRIBUTE}="a1-jj-1"></div>
                </div>
              </div>
              <div ${ROW_CONTAINER_ATTRIBUTE}>
                <div ${KEY_DATA_ATTRIBUTE}="a1-k"></div>
              </div>
            </div>
            <div ${KEY_DATA_ATTRIBUTE}="a2">
              <div ${KEY_DATA_ATTRIBUTE}="a2-i">
                <div ${KEY_DATA_ATTRIBUTE}="a2-i-1"></div>
              </div>
              <div ${KEY_DATA_ATTRIBUTE}="a2-ii"></div>
            </div>
          </div>
          <div>
            <div ${ROW_CONTAINER_ATTRIBUTE}>
              <div>
                <div ${KEY_DATA_ATTRIBUTE}="b1">
                  <div>
                    <div ${KEY_DATA_ATTRIBUTE}="b1-i"></div>
                  </div>
                </div>
                <div ${KEY_DATA_ATTRIBUTE}="b2">
                  <div>
                    <div ${KEY_DATA_ATTRIBUTE}="b2-i"></div>
                  </div>
                  <div ${KEY_DATA_ATTRIBUTE}="b2-ii"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
        'text/html'
      );

      test('ignoring sub-containers', () => {
        const tree = {
          key: null,
          children: [],
        };
        const elementMap: any = {};
        discoverOrderingStructure(tree, elementMap, html, {
          crossAxisRowPosition: 0,
          crossContainerBoundaries: false,
          parentIndex: [],
        });
        expect(tree).toEqual({
          key: null,
          children: [
            [
              {
                key: 'a1',
                children: [
                  [
                    {
                      key: 'a1-i',
                      children: [
                        [
                          {
                            key: 'a1-i-1',
                            children: [],
                          },
                          {
                            key: 'a1-i-2',
                            children: [],
                          },
                        ],
                      ],
                    },
                    {
                      key: 'a1-ii',
                      children: [],
                    },
                  ],
                  [
                    {
                      key: 'a1-j',
                      children: [],
                    },
                    {
                      key: 'a1-jj',
                      children: [
                        [
                          {
                            key: 'a1-jj-1',
                            children: [],
                          },
                        ],
                      ],
                    },
                  ],
                  [
                    {
                      key: 'a1-k',
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
                      key: 'a2-i',
                      children: [
                        [
                          {
                            key: 'a2-i-1',
                            children: [],
                          },
                        ],
                      ],
                    },
                    {
                      key: 'a2-ii',
                      children: [],
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
                      key: 'b1-i',
                      children: [],
                    },
                  ],
                ],
              },
              {
                key: 'b2',
                children: [
                  [
                    {
                      key: 'b2-i',
                      children: [],
                    },
                    {
                      key: 'b2-ii',
                      children: [],
                    },
                  ],
                ],
              },
            ],
          ],
        });
        expect(Object.keys(elementMap).sort()).toEqual(
          [
            'a1',
            'a2',
            'a1-i',
            'a1-j',
            'a1-ii',
            'a1-jj',
            'a1-i-1',
            'a1-i-2',
            'a1-jj-1',
            'a1-k',
            'a2-i',
            'a2-i-1',
            'a2-ii',
            'b1',
            'b2',
            'b1-i',
            'b2-i',
            'b2-ii',
          ].sort()
        );

        expect(elementMap['a1-jj-1'].index).toEqual([
          [0, 0],
          [1, 1],
          [0, 0],
        ]);

        expect(elementMap['a2'].index).toEqual([[1, 0]]);

        expect(elementMap['a2-ii'].index).toEqual([
          [1, 0],
          [1, 0],
        ]);

        expect(elementMap['b2-i'].index).toEqual([
          [1, 1],
          [0, 0],
        ]);
      });
    });
  });
});
