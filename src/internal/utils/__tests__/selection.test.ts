import {
  KEY_DATA_ATTRIBUTE,
  PARENT_CONTAINER_ATTRIBUTE,
} from '../../constants';
import { discoverOrderingStructure } from '../selection';

describe('selection utils', () => {
  describe('discover ordering structure', () => {
    describe('can convert an example DOM structure into correct tree ordering', () => {
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

      test('with a full tree structure, ignoring sub-containers', () => {
        const tree = {
          key: null,
          children: [],
        };
        const elementMap: any = {};
        discoverOrderingStructure(tree, elementMap, html, []);
        expect(tree).toEqual({
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [],
                      key: 'a-i-1',
                    },
                    {
                      children: [],
                      key: 'a-i-2',
                    },
                  ],
                  key: 'a-i',
                },
                {
                  children: [],
                  key: 'a-ii',
                },
              ],
              key: 'a',
            },
            {
              children: [
                {
                  children: [],
                  key: 'b-i',
                },
              ],
              key: 'b',
            },
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
        expect(elementMap['a-i-2'].index).toEqual([0, 0, 1]);
      });

      test('with a flat structure, ignoring sub-containers', () => {
        const tree = {
          key: null,
          children: [],
        };
        const elementMap: any = {};
        discoverOrderingStructure(tree, elementMap, html, [], {
          flatten: true,
        });
        expect(tree).toEqual({
          key: null,
          children: [
            {
              key: 'a',
              children: [],
            },
            {
              key: 'a-i',
              children: [],
            },
            {
              key: 'a-i-1',
              children: [],
            },
            {
              key: 'a-i-2',
              children: [],
            },
            {
              key: 'a-ii',
              children: [],
            },
            {
              key: 'b',
              children: [],
            },
            {
              key: 'b-i',
              children: [],
            },
          ],
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
        expect(elementMap['a-i-2'].index).toEqual([3]);
      });
    });
  });
});
