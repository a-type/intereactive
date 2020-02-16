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
import { OverridableProps } from '../internal/types';

export type RovingTabContextValue = {
  onSelect: (key: string, value?: any) => any;
  goToNext: () => any;
  goToPrevious: () => any;
  goToNextOrthogonal: () => any;
  goToPreviousOrthogonal: () => any;
  goUp: () => any;
  goDown: () => any;
  activeKey: string | null;
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
  activeKey: null,
  selectedKey: null,
  id: null,
});

export default RovingTabContext;

export type RovingTabContainerProps = OverridableProps<
  {
    noWrap?: boolean;
    observeDeep?: boolean;
    itemCount?: number;
    value?: string | null;
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

    const handleMove = useCallback((element: HTMLElement | null) => {
      if (element) {
        element.focus();
      }
    }, []);

    const {
      activeKey,
      goToNext,
      goToPrevious,
      goUp,
      goDown,
      goToNextOrthogonal,
      goToPreviousOrthogonal,
      getElementInfo,
      handleContainerElement,
      setActiveIndex,
    } = useSelectableChildren({
      observeDeep,
      itemCount,
      wrap: !noWrap,
      onMove: handleMove,
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

    useEffect(() => {
      if (value) {
        const info = getElementInfo(value);
        if (!info) {
          console.warn(
            `Value of roving tab group ${id} was updated to ${value}, but no element index was found`
          );
          return;
        }

        // update selection state, but don't focus the element
        setActiveIndex(info.index || []);
      }
    }, [value, getElementInfo, setActiveIndex]);

    // when the user selects an item, force update the selected index
    // TODO: move this behavior to a focus handler in the hook?
    const onSelect = useCallback(
      (key: string, value?: any) => {
        const info = getElementInfo(key);
        if (!info) {
          console.warn(
            `Roving tab group ${id} selected ${key}, but the associated element wasn't found in the element map`
          );
          return;
        }

        // update selection state and focus new element
        setActiveIndex(info.index);
        info.element.focus();

        onChange && onChange(value);
      },
      [setActiveIndex, getElementInfo, onChange]
    );

    const contextValue: RovingTabContextValue = {
      onSelect,
      activeKey,
      selectedKey: value || null,
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
