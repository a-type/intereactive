import { ROW_CONTAINER_ATTRIBUTE } from '../internal/constants';

export const useRow = () => {
  return {
    props: {
      [ROW_CONTAINER_ATTRIBUTE]: true,
    },
  };
};
