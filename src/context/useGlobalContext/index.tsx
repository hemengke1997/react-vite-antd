import { createContainer } from 'context-state';
import { useEffect, useState } from 'react';

export type InitialStateType = {
  loading: boolean;
  userInfo: Record<string, any>;
  accessInfo: string[];
};

function useGlobalContext() {
  useEffect(() => {
    console.log('global');
    // 请求
  }, []);

  const [initialState, setInitialState] = useState<InitialStateType>({
    loading: false,
    userInfo: {},
    accessInfo: [],
  });

  return {
    initialState,
    setInitialState,
  };
}

export default createContainer(useGlobalContext);
