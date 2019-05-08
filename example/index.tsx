import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FocusProvider, useFocusable, SubFocusProvider } from '../.';
import './index.css';

const Button = props => {
  const focusProps = useFocusable(props);

  return <button {...props} {...focusProps} />;
};

const Widget = props => {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  return (
    <SubFocusProvider
      axis="horizontal"
      onSelectionChanged={({ index }) => setSelectedIndex(index)}
      selectedIndex={selectedIndex}
    >
      {({ props, isActive }) => (
        <div
          {...props}
          style={{ background: isActive ? '#00000010' : 'transparent' }}
        >
          <Button>Arrow keys to me</Button>
          <Button>Arrow keys to me</Button>
        </div>
      )}
    </SubFocusProvider>
  );
};

const App = () => {
  return (
    <FocusProvider>
      {() => (
        <div>
          <Button>Tab to me</Button>
          <Button>Tab to me</Button>
          <Widget />
        </div>
      )}
    </FocusProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
