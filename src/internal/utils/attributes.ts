import { KEY_DATA_ATTRIBUTE, INDEX_DATA_ATTRIBUTE } from '../constants';

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
