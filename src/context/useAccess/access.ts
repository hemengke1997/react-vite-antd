import { InitialStateType } from '../useGlobalContext';

export default function (initialState: InitialStateType) {
  console.log(initialState, 'initialState');
  return {
    canReadFoo: false,
  };
}
