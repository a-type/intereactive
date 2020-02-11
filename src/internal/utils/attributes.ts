import {
  KEY_DATA_ATTRIBUTE,
  INDEX_DATA_ATTRIBUTE,
  ROW_CONTAINER_ATTRIBUTE,
} from '../constants';
import { isHtmlElement } from './guards';

export const getElementKey = (node: Node) => {
  if (isHtmlElement(node)) {
    return node.getAttribute(KEY_DATA_ATTRIBUTE) || null;
  }
  return null;
};

export const getElementIndex = (node: Node) => {
  if (isHtmlElement(node)) {
    const indexString = node.getAttribute(INDEX_DATA_ATTRIBUTE) || null;
    return parseInt(indexString || '', 10) || null;
  }
  return null;
};

export const isElementRow = (node: Node) => {
  if (!isHtmlElement(node)) {
    return null;
  }
  return node.hasAttribute(ROW_CONTAINER_ATTRIBUTE);
};
