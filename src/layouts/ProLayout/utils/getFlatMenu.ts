import { MenuDataItem } from '../typings';
import { stripQueryStringAndHashFromPath } from './getMenuData';

/**
 * 获取打平的 menuData
 * 已 path 为 key
 * @param menuData
 */
export const getFlatMenu = (
  menuData: MenuDataItem[] = [],
): {
  [key: string]: MenuDataItem;
} => {
  let menus: {
    [key: string]: MenuDataItem;
  } = {};

  menuData.forEach((item) => {
    if (!item || !item.key) {
      return;
    }

    menus[stripQueryStringAndHashFromPath(item.path || item.key || '/')] = {
      ...item,
    };
    menus[item.key || item.path || '/'] = { ...item };

    if (item.children) {
      menus = { ...menus, ...getFlatMenu(item.children) };
    }
  });
  return menus;
};

export default getFlatMenu;
