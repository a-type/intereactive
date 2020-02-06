import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  FocusContainer,
  useRovingTabItem,
  RovingTabProvider,
  useFocusable,
  useImperativeFocus,
} from '../src';
import './index.css';
import { SelectionProvider } from '../src/contexts/selection';
import { Manager, Reference, Popper } from 'react-popper';
import { useSelectionFocusElement } from '../src/hooks/useSelectionFocusElement';
import { useSelectionItem } from '../src/hooks/useSelectionItem';
import { useSelectionOptionsContainer } from '../src/hooks/useSelectionOptionsContainer';

const FocusableButton = props => {
  const focusableProps = useFocusable(props);
  return <button {...props} {...focusableProps} />;
};
const SelectableButton = props => {
  const { props: selectableProps, selected } = useRovingTabItem(props);
  return <button {...props} {...selectableProps} />;
};
const Link = props => {
  return <a {...props} />;
};

const ImperativeFocus = () => {
  const focus = useImperativeFocus();

  return (
    <div className="row">
      <FocusableButton id="focus-me">Keep tabbing here</FocusableButton>
      <FocusableButton id="focus-other" onClick={() => focus('focus-me')}>
        Press to focus previous button
      </FocusableButton>
    </div>
  );
};

const RovingTab = () => {
  const [selectedValue, setSelectedValue] = React.useState('in');

  return (
    <RovingTabProvider value={selectedValue} onChange={setSelectedValue}>
      {({ props, isFocusWithinContainer }) => (
        <div
          {...props}
          className={isFocusWithinContainer ? 'subfocus-active card' : 'card'}
        >
          <p>
            Arrow keys can be used inside a selectable group to move between
            options. Each option becomes the focused element when you move to
            it. This is a technique called "roving tab index", since we move the
            "tab index" property (which controls the ability to focus) between
            the elements as you navigate.
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
    </RovingTabProvider>
  );
};

const SelectInput = React.forwardRef<any, any>((props, ref) => {
  const { props: selectionProps } = useSelectionFocusElement({ ref });

  return (
    <input {...props} {...selectionProps} placeholder="Type something..." />
  );
});

const SelectOption = React.forwardRef<
  any,
  { value: string; children: React.ReactNode }
>(({ value, ...props }, ref) => {
  const { props: selectionProps, isActive } = useSelectionItem({ value });

  return (
    <li
      role="option"
      aria-selected={isActive}
      {...props}
      {...selectionProps}
      ref={ref}
      className="select-option"
    />
  );
});

const SelectOptions = React.forwardRef<
  any,
  { children: React.ReactNode; className?: string; style?: React.CSSProperties }
>((props, ref) => {
  const { props: selectionProps } = useSelectionOptionsContainer({ ref });

  return <ul role="listbox" {...props} {...selectionProps} />;
});

const defaultOptions = [
  {
    id: '1',
    name: 'IN',
  },
  {
    id: '2',
    name: 'TE',
  },
  {
    id: '3',
    name: 'RR',
  },
  {
    id: '4',
    name: 'EA',
  },
  {
    id: '5',
    name: 'CT',
  },
  {
    id: '6',
    name: 'IV',
  },
  {
    id: '7',
    name: 'E.',
  },
];

const Select = () => {
  const [value, setValue] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [options, setOptions] = React.useState([...defaultOptions]);

  // update the input value when the user types
  const handleInputChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(ev.target.value);
    },
    [setInputValue]
  );

  // filter available options by the input value
  const filteredOptions = React.useMemo(
    () =>
      options.filter(opt =>
        opt.name.toLowerCase().includes(inputValue?.toLowerCase() ?? '')
      ),
    [inputValue, options]
  );

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      // using a static "create" value is one way to allow custom entries
      // not included in the suggestions list.
      if (newValue === 'create') {
        // hypothetically, you'd want to call some API or something in a real app.
        // for this simple example, we just push the new option onto our list
        const newId = `${Math.floor(Math.random() * 1000000)}`;
        setOptions(existing => [
          ...existing,
          {
            id: newId,
            name: inputValue,
          },
        ]);
        setValue(newId);
      } else {
        setValue(newValue);
      }
    },
    [setValue, inputValue, setOptions]
  );

  // when the selected value changes, populate it into the input
  React.useEffect(() => {
    setInputValue(options.find(({ id }) => id === value)?.name ?? '');
  }, [value, setInputValue]);

  return (
    <SelectionProvider value={value} onChange={handleValueChange} closeOnSelect>
      {({ isOpen }) => (
        <>
          <Manager>
            <Reference>
              {({ ref }) => (
                <SelectInput
                  ref={ref}
                  onChange={handleInputChange}
                  value={inputValue}
                />
              )}
            </Reference>
            {isOpen && (
              <Popper placement="bottom">
                {({ ref, style, placement }) => (
                  <SelectOptions
                    className="popper"
                    ref={ref}
                    style={style}
                    data-placement={placement}
                  >
                    {filteredOptions.map(opt => (
                      <SelectOption key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectOption>
                    ))}
                    {filteredOptions.length === 0 && (
                      <SelectOption value="create">{inputValue}</SelectOption>
                    )}
                  </SelectOptions>
                )}
              </Popper>
            )}
          </Manager>
        </>
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
      <div className="row" style={{ marginBottom: 12 }}>
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
          components with a set of easy-to-use tools.
        </p>
      </section>
      <section>
        <h2>imperative focus</h2>
        <p>
          When you wrap your app in a FocusContainer, you can imperatively focus
          an element from anywhere by id.
        </p>
        <ImperativeFocus />
      </section>
      <section>
        <h2>option selection</h2>
        <p>
          It wouldn't be a selection tool without an autocomplete input demo.
          interreactive provides tooling to control visual selection via a
          disconnected element's keyboard interactions. By connecting an
          interactive input to a list of options, you can create your own
          customized autocomplete experience with just a few hooks.
        </p>
        <Select />
        <p>
          In the demo above, you can even type in your own values to add new
          items. interreactive doesn't get in the way of customized behaviors
          you want to implement, or force you to implement them in specific
          ways. It handles the interactivity of selecting items from the list -
          that's all.
        </p>
      </section>
      <section>
        <h2>"roving tab index"</h2>
        <RovingTab />
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
