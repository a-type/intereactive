import * as React from 'react';
import { RovingTabContainerProps } from '../../src/contexts/rovingTab';
import {
  useRow,
  useRovingTabItem,
  RovingTabContainer,
  keyActionPresets,
} from '../../src';

const GridRow: React.FC<React.HTMLAttributes<HTMLDivElement>> = props => {
  const { props: rowProps } = useRow();

  return (
    <div
      className="flex-grid-row"
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      {...props}
      {...rowProps}
    />
  );
};

const GridItem = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { value: string }
>(({ value, ...rest }, ref) => {
  const { props: itemProps } = useRovingTabItem({
    value,
    ref,
    keyActions: keyActionPresets.grid.horizontal,
  });

  return (
    <button
      className="flex-grid-item"
      style={{ flex: '1 0 0' }}
      {...rest}
      {...itemProps}
    />
  );
});

const Grid = React.forwardRef<HTMLDivElement, RovingTabContainerProps>(
  (props, ref) => {
    return <RovingTabContainer id="flex-grid-demo" ref={ref} {...props} />;
  }
);

const GridDemo: React.FC = () => {
  return (
    <Grid
      className="flex-grid"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {[0, 1, 2, 3].map(rowIdx => (
        <GridRow key={rowIdx}>
          {[0, 1, 2, 3].map(itemIdx => (
            <GridItem key={itemIdx} value={`${rowIdx * 4 + itemIdx}`}>
              Item {rowIdx * 4 + itemIdx}
            </GridItem>
          ))}
        </GridRow>
      ))}
    </Grid>
  );
};

export default GridDemo;
