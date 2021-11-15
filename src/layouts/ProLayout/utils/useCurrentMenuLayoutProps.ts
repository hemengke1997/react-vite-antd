import { useEffect, useState } from 'react';
import type { ProSettings } from '../defaultSettings';

const omitUndefined = <T>(obj: T): T => {
  const newObj = {} as T;
  Object.keys(obj || {}).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  if (Object.keys(newObj).length < 1) {
    return undefined as any;
  }
  return newObj;
};

const useCurrentMenuLayoutProps = (currentMenu: ProSettings) => {
  const [currentMenuLayoutProps, setCurrentMenuLayoutProps] = useState({});

  useEffect(() => {
    setCurrentMenuLayoutProps(
      omitUndefined({
        // 有时候会变成对象，是原来的方式
        menuRender: currentMenu.menuRender,
        menuHeaderRender: currentMenu.menuHeaderRender,
        headerRender: currentMenu.headerRender,
        fixSiderbar: currentMenu.fixSiderbar,
      }),
    );
  }, [
    currentMenu.menuRender,
    currentMenu.menuHeaderRender,
    currentMenu.headerRender,
    currentMenu.fixSiderbar,
  ]);
  return currentMenuLayoutProps;
};

export default useCurrentMenuLayoutProps;
