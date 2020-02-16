import { useRef, useEffect } from 'react';
export const useIsMounted = () => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    setTimeout(() => (isMountedRef.current = true), 0);
  });
  return isMountedRef.current;
};

export const usePrevious = <T>(val: T) => {
  const previousRef = useRef(val);
  useEffect(() => {
    previousRef.current = val;
  });
  return previousRef.current;
};
