import { useIdOrGenerated, useRefOrProvided } from './utils';
import { useContext, useEffect, Ref } from 'react';
import { SelectionElementContext } from './contexts/selection';
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
  const selectionContext = useContext(SelectionElementContext);

  const ref = useRefOrProvided<T>(providedRef);

  useEffect(() => {
    if (!focusContext) {
      return;
    }

    focusContext.register(id, ref);
    return () => focusContext.unregister(id);
  }, [focusContext && focusContext.groupName, ref]);

  useEffect(() => {
    if (!subFocusContext) {
      return;
    }

    subFocusContext.register(id, ref);
    return () => subFocusContext.unregister(id);
  }, [subFocusContext && subFocusContext.id, ref]);

  useEffect(() => {
    if (!selectionContext) {
      return;
    }

    selectionContext.register(id);
    return () => {
      if (selectionContext) {
        selectionContext.unregister(id);
      }
    };
  }, [selectionContext && selectionContext.id, id]);

  return {
    id,
    ref,
    'aria-selected': selectionContext && id === selectionContext.selectedId,
    tabIndex: tabbable && !selectionContext ? 0 : -1,
  };
};
