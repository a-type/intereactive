import { useContext, Ref } from 'react';
import SelectionContext from '../contexts/selection';
import { useCombinedRefs } from '../internal/utils/refs';
import {
  getSelectItemsGroupId,
  getSelectionItemId,
} from '../internal/utils/ids';

export type UseSelectionItemsContainerOptions = {
  ref?: Ref<any>;
};

export const useSelectionItemsContainer = (
  options: UseSelectionItemsContainerOptions
) => {
  const { ref } = options;
  const { containerRef, activeKey, id: groupId } = useContext(SelectionContext);
  const combinedRef = useCombinedRefs(containerRef, ref);

  const props = {
    ref: combinedRef,
    id: getSelectItemsGroupId(groupId),
    'aria-activedescendant': activeKey
      ? getSelectionItemId(groupId, activeKey)
      : undefined,
  };

  return { props };
};
