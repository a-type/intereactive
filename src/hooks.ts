import { useIdOrGenerated, useRefOrProvided } from './utils';
import { useContext, useEffect, Ref } from 'react';
import { FocusContext } from './contexts/focus';
import { SubFocusContext } from './contexts/subFocus';

export type SelectableItemConfig = {
  id?: string;
};

export type FocusableConfig<T extends HTMLElement> = {
  id?: string;
  tabbable?: boolean;
  ref?: Ref<T> | null;
};

export const useFocusable = <T extends HTMLElement>({
  id: providedId,
  tabbable = true,
  ref: providedRef,
}: FocusableConfig<T>) => {
  const id = useIdOrGenerated(providedId, 'focusable');

  const focusContext = useContext(FocusContext);
  const subFocusContext = useContext(SubFocusContext);

  const ref = useRefOrProvided<T>(providedRef);

  useEffect(() => {
    if (!focusContext) {
      return;
    }

    focusContext.register(id, ref);
    return () => focusContext.unregister(id);
  }, [focusContext && focusContext.id, ref]);

  useEffect(() => {
    if (!subFocusContext) {
      return;
    }

    subFocusContext.register(id, ref);
    return () => subFocusContext.unregister(id);
  }, [subFocusContext && subFocusContext.id, ref]);

  return {
    id,
    ref,
    ...(!subFocusContext ? { tabIndex: tabbable ? 0 : -1 } : {}),
  };
};
