import * as React from 'react';
import { RovingTabContainerProps } from '../../src/contexts/rovingTab';
import {
  useRow,
  useRovingTabItem,
  RovingTabContainer,
  keyActionPresets,
} from '../../src';

const TableRow: React.FC = props => {
  const { props: rowProps } = useRow();

  return <tr className="table-row" {...props} {...rowProps} />;
};

const TableCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.HTMLAttributes<HTMLTableDataCellElement> & { value: string }
>(({ value, ...rest }, ref) => {
  const { props: itemProps } = useRovingTabItem({
    value,
    ref,
    keyActions: keyActionPresets.grid.horizontal,
  });

  return <td className="table-cell" {...rest} {...itemProps} />;
});

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
