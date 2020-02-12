import React, { forwardRef } from 'react';
import { useRow } from '../hooks/useRow';
import { OverridableProps } from '../internal/types';

type RowProps = OverridableProps<{}, 'button'>;

export const Row = forwardRef<any, RowProps>(
  ({ component: CustomComponent = 'button', ...props }, ref) => {
    const { props: rowProps } = useRow();

    return <CustomComponent {...props} {...rowProps} ref={ref} />;
  }
);
