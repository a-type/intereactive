import * as React from 'react';
import { RovingTabItem, RovingTabContainer } from '../../src';

const ToggleButton = React.forwardRef<
  HTMLButtonElement,
  { children?: any; value?: string }
>((props, ref) => (
  <RovingTabItem
    {...props}
    ref={ref}
    activeProps={{ className: 'generic-active' }}
  />
));

export const RovingTab = () => {
  const [selectedValue, setSelectedValue] = React.useState<string | null>('in');

  return (
    <RovingTabContainer
      className="card"
      value={selectedValue}
      onChange={setSelectedValue}
    >
      <p>
        Arrow keys can be used inside a selectable group to move between
        options. Each option becomes the focused element when you move to it.
        This is a technique called "roving tab index", since we move the "tab
        index" property (which controls the ability to focus) between the
        elements as you navigate.
      </p>
      <div className="row">
        <ToggleButton value="in">in</ToggleButton>
        <ToggleButton value="te">te</ToggleButton>
        <ToggleButton value="rr">rr</ToggleButton>
        <ToggleButton value="ea">ea</ToggleButton>
        <ToggleButton value="ct">ct</ToggleButton>
        <ToggleButton value="iv">iv</ToggleButton>
        <ToggleButton value="e.">e.</ToggleButton>
      </div>
      <p>
        If a user tabs back into this group, the last focused element will be
        restored. Try it.
      </p>
    </RovingTabContainer>
  );
};
