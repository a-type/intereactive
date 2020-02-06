import React, {
  createContext,
  FC,
  useState,
  useCallback,
  useEffect,
  Ref,
} from 'react';
import { useSelectableChildren } from '../utils';

export type SelectionContextValue = {
  onSelect: (value?: string) => any;
  goToNext: () => any;
  goToPrevious: () => any;
  selectedKey: string | null;
  setIsOpen: (open: boolean) => any;
  containerRef: Ref<any>;
};

const SelectionContext = createContext<SelectionContextValue>({
  onSelect: () => {},
  goToNext: () => {},
  goToPrevious: () => {},
  selectedKey: null,
  setIsOpen: () => {},
  containerRef: null,
});

export default SelectionContext;

export interface SelectionContextProviderProps {
  noWrap?: boolean;
  observeDeep?: boolean;
  itemCount?: number;
  value?: string | null;
  onChange: (value: string) => any;
  children: (props: SelectionContextProviderRenderProps) => JSX.Element;
  closeOnSelect?: boolean;
}

export interface SelectionContextProviderRenderProps {
  isOpen: boolean;
}

export const SelectionProvider: FC<SelectionContextProviderProps> = ({
  noWrap,
  children,
  onChange,
  observeDeep,
  itemCount,
  value,
  closeOnSelect,
  ...rest
}) => {
  // a selection provider acts kind of like a roving tab system, except the
  // items themselves don't get focus. The focus remains on a single element
  // (like an input for an autocomplete), which also handles keyboard interaction.
  // changes in state from that interaction are reflected in the items visually

  const {
    setSelectedIndex,
    goToNext,
    goToPrevious,
    findElementIndex,
    selectedKey,
    handleContainerElement,
    selectedIndex,
  } = useSelectableChildren({
    observeDeep,
    itemCount,
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useCallback(
    (el: HTMLElement) => {
      handleContainerElement(el);
    },
    [handleContainerElement]
  );

  // when the controlled value changes, update the selected index to match
  useEffect(() => {
    const idx = value ? findElementIndex(value) : 0;
    setSelectedIndex(idx);
  }, [value, findElementIndex]);

  /** either selects the provided value, or the current chosen value */
  const onSelect = useCallback(
    (value?: string) => {
      onChange(value || selectedKey);
      if (closeOnSelect) {
        setIsOpen(false);
      }
    },
    [selectedKey, onChange, closeOnSelect, setIsOpen]
  );

  const contextValue: SelectionContextValue = {
    setIsOpen,
    selectedKey,
    goToNext,
    goToPrevious,
    onSelect,
    containerRef,
  };

  const renderProps = {
    isOpen,
  };

  console.debug(selectedKey, selectedIndex);

  return (
    <SelectionContext.Provider value={contextValue} {...rest}>
      {children(renderProps)}
    </SelectionContext.Provider>
  );
};
