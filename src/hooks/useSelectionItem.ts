import {
  KEY_DATA_ATTRIBUTE,
  INDEX_DATA_ATTRIBUTE,
} from '../internal/constants';
import { useContext, useCallback } from 'react';
import SelectionContext from '../contexts/selection';
import { useIdOrGenerated } from '../internal/utils/ids';
export type SelectionItemOptions = {
  value?: string;
  index?: number;
};

export const useSelectionItem = ({ value, index }: SelectionItemOptions) => {
  const key = useIdOrGenerated(value, 'selection-item');

  const { onSelect, selectedKey } = useContext(SelectionContext);

  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect]);

  const props = {
    [KEY_DATA_ATTRIBUTE]: key,
    [INDEX_DATA_ATTRIBUTE]: index,
    onClick: handleClick,
  };

  return { props, isActive: selectedKey === key };
};
