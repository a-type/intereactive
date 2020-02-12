import {
  KEY_DATA_ATTRIBUTE,
  X_INDEX_DATA_ATTRIBUTE,
  Y_INDEX_DATA_ATTRIBUTE,
} from '../internal/constants';
import { useContext, useCallback } from 'react';
import SelectionContext from '../contexts/selection';
import { useIdOrGenerated } from '../internal/utils/ids';
import { normalizeCoordinate } from '../internal/utils/indexing';

export type SelectionItemOptions = {
  /**
   * Optionally supply a value represented by this
   * item. This value will be reported by the Selection system if the user selects the
   * item.
   */
  value?: string;
  /**
   * For advanced use cases, you can manually specify the ordering of this item. If
   * omitted, order will be inferred by DOM structure.
   */
  coordinate?: number | [number, number];
};

export const useSelectionItem = ({
  value,
  coordinate,
}: SelectionItemOptions) => {
  const key = useIdOrGenerated(value, 'selection-item');

  const { onSelect, selectedKey } = useContext(SelectionContext);

  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect]);

  const [manualXCoordinate, manualYCoordinate] = normalizeCoordinate(
    coordinate
  );

  const props = {
    [KEY_DATA_ATTRIBUTE]: key,
    [X_INDEX_DATA_ATTRIBUTE]: manualXCoordinate,
    [Y_INDEX_DATA_ATTRIBUTE]: manualYCoordinate,
    onClick: handleClick,
  };

  return { props, selected: selectedKey === key };
};
