import * as React from 'react';
import { RovingTabItem, RovingTabContainer } from '../../src';

export const RovingTab = () => {
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);

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
        <RovingTabItem value="in">in</RovingTabItem>
        <RovingTabItem value="te">te</RovingTabItem>
        <RovingTabItem value="rr">rr</RovingTabItem>
        <RovingTabItem value="ea">ea</RovingTabItem>
        <RovingTabItem value="ct">ct</RovingTabItem>
        <RovingTabItem value="iv">iv</RovingTabItem>
        <RovingTabItem value="e.">e.</RovingTabItem>
      </div>
      <p>
        If a user tabs back into this group, the last focused element will be
        restored. Try it.
      </p>
    </RovingTabContainer>
  );
};
