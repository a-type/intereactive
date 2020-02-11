import * as React from 'react';
import { RovingTabContainerProps } from '../../src/contexts/rovingTab';
import {
  useRow,
  useRovingTabItem,
  RovingTabContainer,
  keyActionPresets,
} from '../../src';

const GridRow: React.FC = props => {
  const { props: rowProps } = useRow();

  return <div className="grid-row" {...props} {...rowProps} />;
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

  return <button className="grid-item" {...rest} {...itemProps} />;
});

const Grid = React.forwardRef<HTMLDivElement, RovingTabContainerProps>(
  (props, ref) => {
    return <RovingTabContainer id="grid-demo" ref={ref} {...props} />;
  }
);

const GridDemo: React.FC = () => {
  return (
    <Grid className="grid">
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
