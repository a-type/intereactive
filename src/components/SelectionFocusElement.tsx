import React, { forwardRef } from 'react';
import { useSelectionFocusElement } from '../hooks/useSelectionFocusElement';
import { OverridableProps } from '../internal/types';
import { KeyActions } from '../keyActions';

export type SelectionFocusElementProps = OverridableProps<
  {
    keyActions?: KeyActions;
  },
  'input'
>;

export const SelectionFocusElement = forwardRef<
  any,
  SelectionFocusElementProps
>(
  (
    { onKeyDown, component: CustomComponent = 'input', keyActions, ...props },
    ref
  ) => {
    const { props: selectionProps } = useSelectionFocusElement({
      ref,
      onKeyDown,
      keyActions,
    });

    return <CustomComponent {...props} {...selectionProps} />;
  }
);
