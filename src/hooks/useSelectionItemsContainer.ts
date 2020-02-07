import { useContext, Ref } from 'react';
import SelectionContext from '../contexts/selection';
import { useCombinedRefs } from '../internal/utils';

export type UseSelectionItemsContainerOptions = {
  ref?: Ref<any>;
};

export const useSelectionItemsContainer = (
  options: UseSelectionItemsContainerOptions
) => {
  const { ref } = options;
  const { containerRef } = useContext(SelectionContext);
  const combinedRef = useCombinedRefs(containerRef, ref);

  const props = {
    ref: combinedRef,
  };

  return { props };
};
