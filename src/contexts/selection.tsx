import React, { createContext, FC, useCallback, useEffect, Ref } from 'react';
import { useSelectableChildren } from '../internal/utils/selection';
import { INITIAL_INDEX } from '../internal/constants';
import { useIdOrGenerated } from '../internal/utils/ids';

export type SelectionContextValue = {
  onSelect: (value?: string) => any;
  goToNext: () => any;
  goToPrevious: () => any;
  goToNextOrthogonal: () => any;
  goToPreviousOrthogonal: () => any;
  goDown: () => any;
  goUp: () => any;
  selectedKey: string | null;
  activeKey: string | null;
  containerRef: Ref<any>;
  id: string;
};

const SelectionContext = createContext<SelectionContextValue>({
  onSelect: () => {},
  goToNext: () => {},
  goToPrevious: () => {},
  goDown: () => {},
  goUp: () => {},
  goToNextOrthogonal: () => {},
  goToPreviousOrthogonal: () => {},
  selectedKey: null,
  containerRef: null,
  activeKey: null,
  id: '',
});

export default SelectionContext;

export type SelectionProviderProps = {
  /**
   * Controls whether the selection should jump back to the first element when
   * the user reaches the last element.
   */
  noWrap?: boolean;
  /**
   * This is a performance optimization. If all the selectable items are direct
   * DOM descendants of the container element, you can enable "shallow" mode to
   * reduce the overhead of scanning the DOM for items.
   */
  shallow?: boolean;
  /**
   * If you are using virtualized items, you must provide the total number
   * of items here to ensure selection works as expected.
   */
  itemCount?: number;
  /**
   * Optionally provide a controlled value to the Selection system. The provided
   * value will be selected by default.
   */
  value?: string | null;
  /**
   * When the user selects an item, its provided value will be passed to this
   * callback.
   */
  onChange?: (value: string) => any;
  /**
   * Supply a unique ID for this selection system. This ID will be used as
   * a prefix for any auto-generated IDs to ensure that IDs are unique.
   * If not provided, a random one will be used.
   */
  id?: string;
};

/**
 * Creates a Selection system, which allows attaching interaction handlers to a
 * focusable item (like an `<input>`) which control the selection state of a
 * disconnected set of elements. Used for things like autocomplete inputs.
 */
export const SelectionProvider: FC<SelectionProviderProps> = props => {
  const {
    noWrap,
    children,
    onChange,
    shallow,
    itemCount,
    value,
    id: providedId,
    ...rest
  } = props;

  const id = useIdOrGenerated(providedId, 'select');

  // a selection provider acts kind of like a roving tab system, except the
  // items themselves don't get focus. The focus remains on a single element
  // (like an input for an autocomplete), which also handles keyboard interaction.
  // changes in state from that interaction are reflected in the items visually
  const {
    setActiveIndex,
    goToNext,
    goToPrevious,
    goDown,
    goUp,
    goToNextOrthogonal,
    goToPreviousOrthogonal,
    getElementInfo,
    activeKey,
    handleContainerElement,
  } = useSelectableChildren({
    observeDeep: !shallow,
    itemCount,
  });

  const containerRef = useCallback(
    (el: HTMLElement) => {
      handleContainerElement(el);
    },
    [handleContainerElement]
  );

  // when the controlled value changes, update the selected index to match
  useEffect(() => {
    if (!value) {
      setActiveIndex(INITIAL_INDEX);
      return;
    }
    const info = getElementInfo(value);
    if (value && !info) {
      console.warn(
        `Value was updated to ${value}, but an element index could not be found`
      );
      return;
    }
    setActiveIndex(info.index);
  }, [value, getElementInfo, setActiveIndex]);

  /** either selects the provided value, or the current chosen value */
  const onSelect = useCallback(
    (value?: string) => {
      const resolvedValue = value || activeKey;
      // TODO: check this code
      resolvedValue && onChange && onChange(resolvedValue);
    },
    [activeKey, onChange]
  );

  const contextValue: SelectionContextValue = {
    activeKey,
    goToNext,
    goToPrevious,
    goDown,
    goUp,
    goToNextOrthogonal,
    goToPreviousOrthogonal,
    onSelect,
    containerRef,
    id,
    selectedKey: value || null,
  };

  return (
    <SelectionContext.Provider value={contextValue} {...rest}>
      {children}
    </SelectionContext.Provider>
  );
};
