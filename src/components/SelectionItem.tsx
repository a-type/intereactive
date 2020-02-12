import React, { forwardRef } from 'react';
import { useSelectionItem } from '../hooks/useSelectionItem';
import { OverridableProps } from '../internal/types';

export type SelectionItemProps = OverridableProps<{ value?: string }, 'li'>;

export const SelectionItem = forwardRef<any, SelectionItemProps>(
  ({ component: CustomComponent = 'li', value, ...props }, ref) => {
    const { props: containerProps, isActive } = useSelectionItem({ value });

    return (
      <CustomComponent
        ref={ref}
        aria-selected={isActive}
        {...props}
        {...containerProps}
      />
    );
  }
);
