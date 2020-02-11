import * as React from 'react';
import { RovingTabContainerProps } from '../../src/contexts/rovingTab';
import {
  useRovingTabItem,
  RovingTabContainer,
  keyActionPresets,
} from '../../src';

const GridItem = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    value: string;
    x: number;
    y: number;
  }
>(({ value, x, y, ...rest }, ref) => {
  const { props: itemProps } = useRovingTabItem({
    value,
    ref,
    keyActions: keyActionPresets.grid.horizontal,
    coordinate: [x, y],
  });

  return <button className="grid-item" {...rest} {...itemProps} />;
});

const Grid = React.forwardRef<HTMLDivElement, RovingTabContainerProps>(
  (props, ref) => {
    return <RovingTabContainer id="grid-demo" ref={ref} {...props} />;
  }
);

const GridDemo: React.FC = () => {
  return (
    <Grid
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '8px',
      }}
    >
      {[
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
      ].map((row, y) =>
        row.map((value, x) => (
          <GridItem key={value} value={`${value}`} x={x} y={y}>
            Item {value}
          </GridItem>
        ))
      )}
    </Grid>
  );
};

export default GridDemo;
