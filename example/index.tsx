import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  FocusProvider,
  useSelectable,
  SelectionProvider,
  useFocusable,
} from '../src';
import './index.css';

const FocusableButton = props => {
  const focusableProps = useFocusable(props);
  return <button {...props} {...focusableProps} />;
};
const SelectableButton = props => {
  const { props: selectableProps, selected } = useSelectable(props);
  return <button {...props} {...selectableProps} />;
};
const Link = props => {
  return <a {...props} />;
};

const Widget = () => {
  const [selectedValue, setSelectedValue] = React.useState('in');

  return (
    <SelectionProvider value={selectedValue} onChange={setSelectedValue}>
      {({ focusElementProps, containerProps }) => (
        <div
          {...containerProps}
          className={false ? 'subfocus-active card' : 'card'}
        >
          <p>
            Arrow keys can be used inside sub-focus containers, grouping several
            interactive components into one for tabbing.
          </p>
          <div className="row">
            <SelectableButton value="in">in</SelectableButton>
            <SelectableButton value="te">te</SelectableButton>
            <SelectableButton value="rr">rr</SelectableButton>
            <SelectableButton value="ea">ea</SelectableButton>
            <SelectableButton value="ct">ct</SelectableButton>
            <SelectableButton value="iv">iv</SelectableButton>
            <SelectableButton value="e.">e.</SelectableButton>
          </div>
          <p>
            You can specify a direction axis: horizontal, vertical, or both.
            interreactive will move the tabindex between focusable children in a
            sub-focus group for you, so that if a user tabs back into this
            group, the last focused element will be restored. Try it.
          </p>
        </div>
      )}
    </SelectionProvider>
  );
};

const Trap = ({ onClose }) => {
  return (
    <FocusProvider trapFocus>
      {({ ref }) => (
        <div className="card" ref={ref}>
          <p>
            There's no use struggling. Your focus is trapped inside this box.
            Don't worry, though, we have plenty of buttons to entertain you.
          </p>
          <div className="row">
            <FocusableButton>you</FocusableButton>
            <FocusableButton>are</FocusableButton>
            <FocusableButton>happy</FocusableButton>
            <FocusableButton>here.</FocusableButton>
          </div>
          <FocusableButton onClick={onClose}>escape</FocusableButton>
        </div>
      )}
    </FocusProvider>
  );
};

const TrapToggle = () => {
  const [showTrap, setShowTrap] = React.useState(false);

  return showTrap ? (
    <Trap onClose={() => setShowTrap(false)} />
  ) : (
    <FocusableButton onClick={() => setShowTrap(true)}>
      enter focus trap
    </FocusableButton>
  );
};

const App = () => {
  return (
    <FocusProvider>
      {() => (
        <main>
          <h1>interreactive</h1>
          <section>
            <p>
              Welcome. Please check your mouse at the door; we use keyboards
              only here. Enjoy your stay.
            </p>
            <FocusableButton>Try tabbing to this button</FocusableButton>
          </section>
          <section>
            <h2>about</h2>
            <p>
              <Link href="https://github.com/a-type/interreactive">
                interreactive
              </Link>{' '}
              is the missing focus and selection manager for React. It enables
              complex tab control and keyboard selection interactions in your
              widgets with a set of easy-to-use tools.
            </p>
            <FocusableButton>Keep tabbing here</FocusableButton>
          </section>
          <section>
            <h2>sub-focus groups ("roving tab index")</h2>
            <Widget />
          </section>
          <section>
            <h2>focus traps</h2>
            <p>
              Often, especially in modal dialogs, you'll want to restrict focus
              to a particular area of the page. It's easy to believe you've done
              this using a click-outside handler, but you need a focus trap to
              cover keyboard navigation.
            </p>
            <TrapToggle />
          </section>
        </main>
      )}
    </FocusProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
