import * as React from 'react';
import {
  useRovingTabItem,
  RovingTabContainer,
  keyActionPresets,
} from '../../src';

type TreeItemProps = {
  value: string;
  label: React.ReactNode;
  children?: React.ReactNode;
};

const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ value, label, children, ...rest }, ref) => {
    const { props: rovingTabProps, selected } = useRovingTabItem({
      value,
      ref,
      keyActions: keyActionPresets.hierarchical.vertical,
    });

    return (
      <li {...rest} {...rovingTabProps}>
        <div className={selected ? 'tree-label-selected' : ''}>{label}</div>
        {children && (
          <RovingTabContainer>
            <ul>{children}</ul>
          </RovingTabContainer>
        )}
      </li>
    );
  }
);

type TreeProps = {};

const Tree: React.FC<TreeProps> = ({ children }) => {
  return (
    <RovingTabContainer>
      <ul>{children}</ul>
    </RovingTabContainer>
  );
};

const TreeDemo: React.FC = () => {
  return (
    <Tree>
      <TreeItem value="one" label="One" />
      <TreeItem value="two" label="Two">
        <TreeItem value="two-a" label="Two A" />
        <TreeItem value="two-b" label="Two B" />
        <TreeItem value="two-c" label="Two C">
          <TreeItem value="two-c-i" label="Two C i" />
          <TreeItem value="two-c-ii" label="Two C ii" />
        </TreeItem>
      </TreeItem>
      <TreeItem value="three" label="Three" />
    </Tree>
  );
};

export default TreeDemo;
