export enum MovementAction {
  GoNext,
  GoPrevious,
  GoUp,
  GoDown,
  GoNextOrthogonal,
  GoPreviousOrthogonal,
  DoNothing,
}

export type KeyActions = {
  up: MovementAction;
  down: MovementAction;
  left: MovementAction;
  right: MovementAction;
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
} = {
  hierarchical: {
    horizontal: {
      up: MovementAction.GoUp,
      down: MovementAction.GoDown,
      left: MovementAction.GoPrevious,
      right: MovementAction.GoNext,
    },
    vertical: {
      up: MovementAction.GoPrevious,
      down: MovementAction.GoNext,
      left: MovementAction.GoUp,
      right: MovementAction.GoDown,
    },
  },
  flat: {
    horizontal: {
      up: MovementAction.DoNothing,
      down: MovementAction.DoNothing,
      left: MovementAction.GoPrevious,
      right: MovementAction.GoNext,
    },
    vertical: {
      up: MovementAction.GoPrevious,
      down: MovementAction.GoNext,
      left: MovementAction.DoNothing,
      right: MovementAction.DoNothing,
    },
    any: {
      up: MovementAction.GoPrevious,
      down: MovementAction.GoNext,
      left: MovementAction.GoPrevious,
      right: MovementAction.GoNext,
    },
  },
  grid: {
    horizontal: {
      up: MovementAction.GoPreviousOrthogonal,
      down: MovementAction.GoNextOrthogonal,
      left: MovementAction.GoPrevious,
      right: MovementAction.GoNext,
    },
    vertical: {
      up: MovementAction.GoPrevious,
      down: MovementAction.GoNext,
      left: MovementAction.GoPreviousOrthogonal,
      right: MovementAction.GoNextOrthogonal,
    },
  },
};
