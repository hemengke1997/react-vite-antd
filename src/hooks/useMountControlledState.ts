import { useEffect, useRef } from 'react';
import useControlledState from './useControlledState';

type Dispatch<A> = (value: A) => void;

function useMountControlledState<S>(
  initialState: S | (() => S),
  option?: {
    defaultValue?: S;
    value?: S;
    onChange?: (value: S, prevValue: S) => void;
    postState?: (value: S) => S;
  },
): [S, Dispatch<S>] {
  const mountRef = useRef<boolean>(false);
  const frame = useRef<number>(0);

  useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
    };
  }, []);

  const [state, setState] = useControlledState<S>(initialState, option);
  const mountSetState: Dispatch<S> = (prevState: S) => {
    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      if (mountRef.current) {
        setState(prevState);
      }
    });
  };

  return [state, mountSetState];
}

export default useMountControlledState;
