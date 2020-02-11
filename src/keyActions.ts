export enum Action {
  GoNext,
  GoPrevious,
  GoUp,
  GoDown,
  GoNextOrthogonal,
  GoPreviousOrthogonal,
  Select,
  DoNothing,
}

export type KeyActions = {
  up: Action;
  down: Action;
  left: Action;
  right: Action;
  enter: Action;
  space: Action;
  escape: Action;
};

export const keyActionPresets: {
  hierarchical: {
    horizontal: KeyActions;
    vertical: KeyActions;
  };
  flat: {
    horizontal: KeyActions;
    vertical: KeyActions;
    any: KeyActions;
  };
  grid: {
    horizontal: KeyActions;
    vertical: KeyActions;
  };
  threeDimensional: {
    horizontal: KeyActions;
    vertical: KeyActions;
  };
} = {
  hierarchical: {
    horizontal: {
      up: Action.GoUp,
      down: Action.GoDown,
      left: Action.GoPrevious,
      right: Action.GoNext,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
    vertical: {
      up: Action.GoPrevious,
      down: Action.GoNext,
      left: Action.GoUp,
      right: Action.GoDown,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
  },
  flat: {
    horizontal: {
      up: Action.DoNothing,
      down: Action.DoNothing,
      left: Action.GoPrevious,
      right: Action.GoNext,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
    vertical: {
      up: Action.GoPrevious,
      down: Action.GoNext,
      left: Action.DoNothing,
      right: Action.DoNothing,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
    any: {
      up: Action.GoPrevious,
      down: Action.GoNext,
      left: Action.GoPrevious,
      right: Action.GoNext,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
  },
  grid: {
    horizontal: {
      up: Action.GoPreviousOrthogonal,
      down: Action.GoNextOrthogonal,
      left: Action.GoPrevious,
      right: Action.GoNext,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
    vertical: {
      up: Action.GoPrevious,
      down: Action.GoNext,
      left: Action.GoPreviousOrthogonal,
      right: Action.GoNextOrthogonal,
      enter: Action.Select,
      space: Action.Select,
      escape: Action.DoNothing,
    },
  },
  threeDimensional: {
    horizontal: {
      up: Action.GoPreviousOrthogonal,
      down: Action.GoNextOrthogonal,
      left: Action.GoPrevious,
      right: Action.GoNext,
      enter: Action.Select,
      space: Action.GoDown,
      escape: Action.GoUp,
    },
    vertical: {
      up: Action.GoPrevious,
      down: Action.GoNext,
      left: Action.GoPreviousOrthogonal,
      right: Action.GoNextOrthogonal,
      enter: Action.Select,
      space: Action.GoDown,
      escape: Action.GoUp,
    },
  },
};
