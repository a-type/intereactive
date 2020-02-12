import React, { forwardRef } from 'react';
import { useSelectionFocusElement } from '../hooks/useSelectionFocusElement';
import { OverridableProps } from '../internal/types';

export type SelectionFocusElementProps = OverridableProps<{}, 'input'>;

export const SelectionFocusElement = forwardRef<
  any,
  SelectionFocusElementProps
>(({ onKeyDown, component: CustomComponent = 'input', ...props }, ref) => {
  const { props: selectionProps } = useSelectionFocusElement({
    ref,
    onKeyDown,
  });

  return <CustomComponent {...props} {...selectionProps} />;
});
