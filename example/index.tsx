import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  FocusContainer,
  useSelectable,
  SelectionProvider,
  useFocusable,
  useImperativeFocus,
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

const SelectableOptions = () => {
  const [selectedValue, setSelectedValue] = React.useState('in');

  return (
    <SelectionProvider value={selectedValue} onChange={setSelectedValue}>
      {({ props, isFocusWithinContainer }) => (
        <div
          {...props}
          className={isFocusWithinContainer ? 'subfocus-active card' : 'card'}
        >
          <p>
            Arrow keys can be used inside a selectable group to move between
            options. Each option becomes the focused element when you move to
            it. This is a technique called "roving tab index", since we move the
            focus-ability property between the elements as you navigate.
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
            If a user tabs back into this group, the last focused element will
            be restored. Try it.
          </p>
        </div>
      )}
    </SelectionProvider>
  );
};

const Trap = ({ onClose }) => {
  return (
    <FocusContainer trapFocus className="card">
      <p>
        There's no use struggling. Your focus is trapped inside this box. Don't
        worry, though, we have plenty of buttons to entertain you.
      </p>
      <div className="row">
        {/** interreactive is compatible with native autoFocus */}
        <FocusableButton autoFocus>you</FocusableButton>
        <FocusableButton>are</FocusableButton>
        <FocusableButton>happy</FocusableButton>
        <FocusableButton>here.</FocusableButton>
      </div>
      <FocusableButton onClick={onClose}>escape</FocusableButton>
    </FocusContainer>
  );
};

const TrapToggle = () => {
  const [showTrap, setShowTrap] = React.useState(false);
  const focus = useImperativeFocus();

  const handleTrapClose = React.useCallback(() => {
    setShowTrap(false);
  }, [focus, setShowTrap]);

  // when the trap is closed, run a side-effect of re-focusing the trigger button
  React.useEffect(() => {
    if (!showTrap) {
      focus('trap-button');
    }
  }, [focus, showTrap]);

  return showTrap ? (
    <Trap onClose={handleTrapClose} />
  ) : (
    <FocusableButton onClick={() => setShowTrap(true)} id="trap-button">
      enter focus trap
    </FocusableButton>
  );
};

const App = () => {
  return (
    <FocusContainer component="main">
      <h1>interreactive</h1>
      <section>
        <p>
          Welcome. Please check your mouse at the door; we use keyboards only
          here. Enjoy your stay.
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
        <h2>selectable options ("roving tab index")</h2>
        <SelectableOptions />
      </section>
      <section>
        <h2>focus traps</h2>
        <p>
          Often, especially in modal dialogs, you'll want to restrict focus to a
          particular area of the page. It's easy to believe you've done this
          using a click-outside handler, but you need a focus trap to cover
          keyboard navigation.
        </p>
        <TrapToggle />
      </section>
    </FocusContainer>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
