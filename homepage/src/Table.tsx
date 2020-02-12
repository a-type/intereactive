import * as React from 'react';
import { RovingTabContainerProps } from '../../src/contexts/rovingTab';
import {
  RovingTabContainer,
  keyActionPresets,
  Row,
  RovingTabItem,
} from '../../src';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>((props, ref) => {
  return <Row className="table-row" component="tr" {...props} ref={ref} />;
});

const TableCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.HTMLAttributes<HTMLTableDataCellElement> & { value: string }
>(({ value, ...rest }, ref) => (
  <RovingTabItem
    component="td"
    className="table-cell"
    {...rest}
    value={value}
    ref={ref}
    keyActions={keyActionPresets.grid.horizontal}
  />
));

const Table = React.forwardRef<HTMLTableElement, RovingTabContainerProps>(
  (props, ref) => {
    return (
      <RovingTabContainer
        component="table"
        id="table-demo"
        ref={ref}
        {...props}
      />
    );
  }
);

const TableDemo: React.FC = () => {
  return (
    <Table className="table">
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
          <th>Column 4</th>
        </tr>
      </thead>
      <tbody>
        {[0, 1, 2, 3].map(rowIdx => (
          <TableRow key={rowIdx}>
            {[0, 1, 2, 3].map(itemIdx => (
              <TableCell key={itemIdx} value={`${rowIdx * 4 + itemIdx}`}>
                Item {rowIdx * 4 + itemIdx}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default TableDemo;
