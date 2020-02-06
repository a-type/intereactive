import { useContext, Ref } from 'react';
import SelectionContext from '../contexts/selection';
import { useCombinedRefs } from '../utils';

export type UseSelectionOptionsContainerOptions = {
  ref?: Ref<any>;
};

export const useSelectionOptionsContainer = ({
  ref,
}: UseSelectionOptionsContainerOptions) => {
  const { containerRef } = useContext(SelectionContext);
  const combinedRef = useCombinedRefs(containerRef, ref);

  const props = {
    ref: combinedRef,
  };

  return { props };
};
