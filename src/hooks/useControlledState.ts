import React from 'react';

/**
 * @description 受控或非受控state，传入value时受控，不传value时不受控
 * 取 initialState < defaultValue < value (优先级升序) 中优先级最高的作为mergedValue
 * @param initialState 一般是父组件传下来的prop
 * @param option
 * defaultValue?: value的默认值
 *
 * value?: 优先级最高
 *
 * postData?: 对返回值mergedValue进行一层处理
 *
 * onChange?: value改变时触发的事件
 * @returns
 */
export default function useControlledState<T, R = T>(
  initialState: T | (() => T),
  option?: {
    defaultValue?: T | (() => T);
    value?: T;
    onChange?: (value: T, prevValue: T) => void;
    postState?: (value: T) => T;
  },
): [R, (value: T | ((prevState: T) => T)) => void] {
  const { defaultValue, value, onChange, postState } = option || {};

  const [innerValue, setInnerValue] = React.useState<T>(() => {
    if (value !== undefined) {
      return value;
    }
    if (defaultValue !== undefined) {
      return typeof defaultValue === 'function'
        ? (defaultValue as any)()
        : defaultValue;
    }
    return typeof initialState === 'function'
      ? (initialState as any)()
      : initialState;
  });

  let mergedValue = value !== undefined ? value : innerValue;

  if (postState) {
    mergedValue = postState(mergedValue);
  }

  function triggerChange(newValue: T | ((prevState: T) => T)) {
    const _newValue =
      typeof newValue === 'function'
        ? (newValue as any)(mergedValue)
        : newValue;

    setInnerValue(_newValue);

    if (mergedValue !== _newValue && onChange) {
      onChange(_newValue as T, mergedValue);
    }
  }

  // Effect of reset value to `undefined`
  const firstRenderRef = React.useRef(true);
  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (value === undefined) {
      setInnerValue(value as T);
    }
  }, [value]);

  return [mergedValue as unknown as R, triggerChange];
}
