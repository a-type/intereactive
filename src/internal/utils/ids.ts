import { useRef } from 'react';

export const generateId = (base?: string): string => {
  return `${base || 'generated'}-${Math.floor(Math.random() * 100000000)}`;
};

export const useIdOrGenerated = (
  providedId?: string,
  idBase?: string
): string => {
  const generatedId = useRef<string>(generateId(idBase));
  if (providedId) {
    return providedId;
  } else {
    return generatedId.current;
  }
};

export const getSelectFocusElementId = (groupId: string) => `${groupId}-input`;
export const getSelectItemsGroupId = (groupId: string) => `${groupId}-options`;
export const getSelectionItemId = (groupId: string, optionKey: string) =>
  `${groupId}-option-${optionKey}`;
