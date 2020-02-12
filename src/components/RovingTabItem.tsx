import React, { forwardRef, ReactNode } from 'react';
import { useRovingTabItem } from '../hooks/useRovingTabItem';
import { KeyActions } from '../keyActions';
import { OverridableProps } from '../internal/types';

type RovingTabItemRenderPropFn = (params: {
  selected: boolean;
  disabled: boolean;
}) => JSX.Element;
type RovingTabItemProps = OverridableProps<
  {
    value?: string;
    coordinate?: number | [number, number];
    keyActions?: KeyActions;
    selectedProps?: { [prop: string]: any };
    disabled?: boolean;
    children?: ReactNode | RovingTabItemRenderPropFn;
  },
  'button'
>;

const defaultSelectedProps = { 'aria-checked': true };

export const RovingTabItem = forwardRef<any, RovingTabItemProps>(
  (
    {
      component: CustomComponent = 'button',
      value,
      coordinate,
      keyActions,
      selectedProps = defaultSelectedProps,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { props: containerProps, selected } = useRovingTabItem({
      value,
      ref,
      coordinate,
      keyActions,
      disabled,
    });

    return (
      <CustomComponent
        {...(selected ? selectedProps : {})}
        {...props}
        {...containerProps}
        disabled={disabled}
      >
        {typeof children === 'function'
          ? (children as RovingTabItemRenderPropFn)({
              selected,
              disabled: !!disabled,
            })
          : children}
      </CustomComponent>
    );
  }
);
