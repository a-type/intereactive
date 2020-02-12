import React, { forwardRef, ReactNode } from 'react';
import { useSelectionItem } from '../hooks/useSelectionItem';
import { OverridableProps } from '../internal/types';

type SelectionItemRenderPropFn = (params: {
  selected: boolean;
  disabled: boolean;
}) => JSX.Element;
export type SelectionItemProps = OverridableProps<
  {
    value?: string;
    selectedProps?: { [prop: string]: any };
    disabled?: boolean;
    children?: ReactNode | SelectionItemRenderPropFn;
  },
  'li'
>;

const defaultSelectedProps = {
  'aria-selected': true,
};

export const SelectionItem = forwardRef<any, SelectionItemProps>(
  (
    {
      component: CustomComponent = 'li',
      value,
      selectedProps = defaultSelectedProps,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { props: containerProps, selected } = useSelectionItem({
      value,
      disabled,
    });

    return (
      <CustomComponent
        ref={ref}
        {...(selected ? selectedProps : {})}
        {...props}
        {...containerProps}
        disabled={disabled}
      >
        {typeof children === 'function'
          ? (children as SelectionItemRenderPropFn)({
              selected,
              disabled: !!disabled,
            })
          : children}
      </CustomComponent>
    );
  }
);
