import React, {
  createContext,
  useCallback,
  useEffect,
  forwardRef,
} from 'react';
import { PARENT_CONTAINER_ATTRIBUTE } from '../internal/constants';
import { useIdOrGenerated } from '../internal/utils/ids';
import { useSelectableChildren } from '../internal/utils/selection';
import { useCombinedRefs } from '../internal/utils/refs';
import { DeepIndex } from '../internal/utils/types';
import { OverridableProps } from '../internal/types';

export type RovingTabContextValue = {
  onSelect: (key: string, value?: any) => any;
  goToNext: () => any;
  goToPrevious: () => any;
  goToNextOrthogonal: () => any;
  goToPreviousOrthogonal: () => any;
  goUp: () => any;
  goDown: () => any;
  selectedKey: string | null;
  id: string | null;
};

const RovingTabContext = createContext<RovingTabContextValue>({
  onSelect: () => {},
  goToNext: () => {},
  goToPrevious: () => {},
  goToNextOrthogonal: () => {},
  goToPreviousOrthogonal: () => {},
  goUp: () => {},
  goDown: () => {},
  selectedKey: null,
  id: null,
});

export default RovingTabContext;

export type RovingTabContainerProps = OverridableProps<
  {
    noWrap?: boolean;
    observeDeep?: boolean;
    itemCount?: number;
    value?: string;
    onChange?: (value: string) => any;
    /**
     * Disables the default behavior to scroll the selected element
     * into view
     */
    disableScrollIntoView?: boolean;
  },
  'div'
>;

export const RovingTabContainer = forwardRef<any, RovingTabContainerProps>(
  (
    {
      noWrap,
      children,
      onChange,
      observeDeep,
      itemCount,
      value,
      component: CustomComponent = 'div',
      disableScrollIntoView,
      ...rest
    },
    ref
  ) => {
    const id = useIdOrGenerated(rest.id);

    const handleSelection = useCallback(
      (element: HTMLElement | null, key: string, index: DeepIndex) => {
        if (index.length === 0) return;

        console.debug(
          `Handling selection of ${element}, key: ${key}, idx: ${JSON.stringify(
            index
          )}`
        );

        if (element) {
          element.focus();
          if (!disableScrollIntoView) {
            element.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth',
            });
          }
        } else {
          console.warn(
            `Selection moved to element with key ${key} (index: ${JSON.stringify(
              index
            )}), but no DOM element was registered to focus (group: ${id})`
          );
        }
      },
      [disableScrollIntoView, id]
    );

    const {
      selectedKey,
      setSelectionDeepIndex,
      goToNext,
      goToPrevious,
      goUp,
      goDown,
      goToNextOrthogonal,
      goToPreviousOrthogonal,
      findElementIndex,
      handleContainerElement,
    } = useSelectableChildren({
      observeDeep,
      itemCount,
      wrap: !noWrap,
      onSelect: handleSelection,
    });

    // ref to the top level container element
    const containerRef = useCallback(
      (el: HTMLElement | null) => {
        handleContainerElement(el);
      },
      [handleContainerElement]
    );
    // combined with user ref, if provided
    const finalRef = useCombinedRefs(containerRef, ref);

    // when the controlled value changes, update the selected index to match
    useEffect(() => {
      if (value) {
        console.debug(
          `Auto updating selection for value change: value: ${value}, group: ${id}`
        );
        const index = findElementIndex(value);
        if (!index) {
          console.warn(
            `Value of roving tab group ${id} was updated to ${value}, but no element index was found`
          );
        }
        setSelectionDeepIndex(index || []);
      }
    }, [value, findElementIndex, setSelectionDeepIndex]);

    // when the user selects an item, force update the selected index
    // TODO: move this behavior to a focus handler in the hook?
    const onSelect = useCallback(
      (key: string, value?: any) => {
        setSelectionDeepIndex(findElementIndex(key));
        onChange && onChange(value);
      },
      [setSelectionDeepIndex, findElementIndex, onChange]
    );

    const contextValue: RovingTabContextValue = {
      onSelect,
      selectedKey,
      goToNext,
      goToPrevious,
      goUp,
      goDown,
      goToNextOrthogonal,
      goToPreviousOrthogonal,
      id,
    };

    const otherContainerProps = {
      [PARENT_CONTAINER_ATTRIBUTE]: true,
    };

    return (
      <RovingTabContext.Provider value={contextValue}>
        {/*  multiline comment format required for prettier and ts to work in jsx.
          this props signature is too complex for TS due to the overridable nature.
        // @ts-ignore */ /* prettier-ignore */}
        <CustomComponent ref={finalRef} {...otherContainerProps} {...rest}>
        {children}
      </CustomComponent>
      </RovingTabContext.Provider>
    );
  }
);
