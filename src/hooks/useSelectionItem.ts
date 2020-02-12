import {
  KEY_DATA_ATTRIBUTE,
  X_INDEX_DATA_ATTRIBUTE,
  Y_INDEX_DATA_ATTRIBUTE,
} from '../internal/constants';
import { useContext, useCallback } from 'react';
import SelectionContext from '../contexts/selection';
import { useIdOrGenerated } from '../internal/utils/ids';
import { normalizeCoordinate } from '../internal/utils/indexing';
import { DISABLED_ATTRIBUTE } from '../internal/constants';

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
  /**
   * If disabled, this item will still exist within the selection navigation,
   * but the user won't be able to select it.
   */
  disabled?: boolean;
};

export const useSelectionItem = ({
  value,
  coordinate,
  disabled,
}: SelectionItemOptions) => {
  const key = useIdOrGenerated(value, 'selection-item');

  const { onSelect, selectedKey } = useContext(SelectionContext);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onSelect(value);
  }, [onSelect, disabled]);

  const [manualXCoordinate, manualYCoordinate] = normalizeCoordinate(
    coordinate
  );

  const props = {
    [KEY_DATA_ATTRIBUTE]: key,
    [X_INDEX_DATA_ATTRIBUTE]: manualXCoordinate,
    [Y_INDEX_DATA_ATTRIBUTE]: manualYCoordinate,
    [DISABLED_ATTRIBUTE]: disabled,
    onClick: handleClick,
  };

  return { props, selected: selectedKey === key, disabled };
};
