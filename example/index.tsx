import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FocusProvider, useFocusable, SubFocusProvider } from '../.';
import './index.css';

const Button = props => <button {...props} {...useFocusable(props)} />;
const Link = props => <a {...props} {...useFocusable(props)} />;

const Widget = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <SubFocusProvider
      axis="both"
      onSelectionChanged={({ index }) => setSelectedIndex(index)}
      selectedIndex={selectedIndex}
    >
      {({ props, isActive }) => (
        <div {...props} className={isActive ? 'subfocus-active card' : 'card'}>
          <p>
            Arrow keys can be used inside sub-focus containers, grouping several
            interactive components into one for tabbing.
          </p>
          <div className="row">
            <Button>in</Button>
            <Button>te</Button>
            <Button>rr</Button>
            <Button>ea</Button>
            <Button>ct</Button>
            <Button>iv</Button>
            <Button>e.</Button>
          </div>
          <p>
            You can specify a direction axis: horizontal, vertical, or both.
            interreactive will move the tabindex between focusable children in a
            sub-focus group for you, so that if a user tabs back into this
            group, the last focused element will be restored. Try it.
          </p>
        </div>
      )}
    </SubFocusProvider>
  );
};

const Trap = ({ onClose }) => {
  return (
    <FocusProvider id="focusTrap" trapFocus>
      {({ props }) => (
        <div className="card" {...props}>
          <p>
            There's no use struggling. Your focus is trapped inside this box.
            Don't worry, though, we have plenty of buttons to entertain you.
          </p>
          <div className="row">
            <Button>you</Button>
            <Button>are</Button>
            <Button>happy</Button>
            <Button>here.</Button>
          </div>
          <Button onClick={onClose}>escape</Button>
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
    <Button onClick={() => setShowTrap(true)}>enter focus trap</Button>
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
            <Button>Try tabbing to this button</Button>
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
            <Button>Keep tabbing here</Button>
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
