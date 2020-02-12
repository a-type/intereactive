import React, { forwardRef } from 'react';
import { useRovingTabItem } from '../hooks/useRovingTabItem';
import { KeyActions } from '../keyActions';
import { OverridableProps } from '../internal/types';

type RovingTabItemProps = OverridableProps<
  {
    value?: string;
    coordinate?: number | [number, number];
    keyActions?: KeyActions;
  },
  'button'
>;

export const RovingTabItem = forwardRef<any, RovingTabItemProps>(
  (
    {
      component: CustomComponent = 'button',
      value,
      coordinate,
      keyActions,
      ...props
    },
    ref
  ) => {
    const { props: containerProps, selected } = useRovingTabItem({
      value,
      ref,
      coordinate,
      keyActions,
    });

    return (
      <CustomComponent aria-checked={selected} {...props} {...containerProps} />
    );
  }
);
