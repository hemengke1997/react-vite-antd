import { MenuDataItem } from '../typings';

export default function getOpenKeysFromMenuData(menuData?: MenuDataItem[]) {
  return (menuData || []).reduce((pre, item) => {
    if (item.key) {
      pre.push(item.key);
    }
    if (item.children) {
      const newArray: string[] = pre.concat(
        getOpenKeysFromMenuData(item.children) || [],
      );
      return newArray;
    }
    return pre;
  }, [] as string[]);
}
