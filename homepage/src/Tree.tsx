import * as React from 'react';
import { RovingTabContainer, keyActionPresets, RovingTabItem } from '../../src';

type TreeItemProps = {
  value: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
};

const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ value, label, children, ...rest }, ref) => (
    <RovingTabItem
      component="li"
      value={value}
      keyActions={keyActionPresets.hierarchical.vertical}
      ref={ref}
      {...rest}
    >
      {({ selected, active }) => {
        const className = active
          ? 'tree-label-active'
          : selected
          ? 'tree-label-selected'
          : 'tree-label';
        return (
          <>
            <div className={className}>{label}</div>
            {children && <ul>{children}</ul>}
          </>
        );
      }}
    </RovingTabItem>
  )
);

type TreeProps = {
  id?: string;
};

const Tree: React.FC<TreeProps> = ({ children, id }) => {
  return (
    <RovingTabContainer id={id}>
      <ul>{children}</ul>
    </RovingTabContainer>
  );
};

const TreeDemo: React.FC = () => {
  return (
    <Tree id="tree-demo">
      <TreeItem value="one" label="One" />
      <TreeItem value="two" label="Two">
        <TreeItem value="two-a" label="Two A" />
        <TreeItem value="two-b" label="Two B" disabled />
        <TreeItem value="two-c" label="Two C">
          <TreeItem value="two-c-i" label="Two C i" disabled />
          <TreeItem value="two-c-ii" label="Two C ii" />
        </TreeItem>
      </TreeItem>
      <TreeItem value="three" label="Three" />
    </Tree>
  );
};

export default TreeDemo;
