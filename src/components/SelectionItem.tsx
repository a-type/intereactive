import React, { forwardRef, ReactNode } from 'react';
import { useSelectionItem } from '../hooks/useSelectionItem';
import { OverridableProps } from '../internal/types';

type SelectionItemRenderPropFn = (params: { selected: boolean }) => JSX.Element;
export type SelectionItemProps = OverridableProps<
  {
    value?: string;
    selectedProps?: { [prop: string]: any };
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
      ...props
    },
    ref
  ) => {
    const { props: containerProps, isActive } = useSelectionItem({ value });

    return (
      <CustomComponent
        ref={ref}
        {...(isActive ? selectedProps : {})}
        {...props}
        {...containerProps}
      >
        {typeof children === 'function'
          ? (children as SelectionItemRenderPropFn)({ selected: isActive })
          : children}
      </CustomComponent>
    );
  }
);
