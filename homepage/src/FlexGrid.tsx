import * as React from 'react';
import { RovingTabContainerProps } from '../../src/contexts/rovingTab';
import {
  RovingTabContainer,
  keyActionPresets,
  Row,
  RovingTabItem,
} from '../../src';

const GridRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <Row
    className="flex-grid-row"
    style={{
      display: 'flex',
      flexDirection: 'row',
    }}
    ref={ref}
    {...props}
  />
));

const GridItem = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { value: string }
>(({ value, ...rest }, ref) => (
  <RovingTabItem
    className="flex-grid-item"
    style={{ flex: '1 0 0' }}
    value={value}
    ref={ref}
    keyActions={keyActionPresets.grid.horizontal}
    {...rest}
  />
));

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
