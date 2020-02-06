import { useContext, Ref, useEffect, useRef } from 'react';
import { useIdOrGenerated, useCombinedRefs } from '../utils';
import { FocusContext } from '../contexts/focus';

export type FocusableConfig<T extends HTMLElement> = {
  id?: string;
  ref?: Ref<T> | null;
};

export const useFocusable = <T extends HTMLElement>({
  id: providedId,
  ref: providedRef,
}: FocusableConfig<T>) => {
  const id = useIdOrGenerated(providedId, 'focusable');

  const focusContext = useContext(FocusContext);

  const internalRef = useRef<T>(null);
  const ref = useCombinedRefs(internalRef, providedRef);

  useEffect(() => {
    if (!focusContext) {
      return;
    }

    focusContext.register(id, internalRef);
    return () => focusContext.unregister(id);
  }, [focusContext && focusContext.id, internalRef]);

  return {
    id,
    ref,
    tabIndex: 0,
  };
};
