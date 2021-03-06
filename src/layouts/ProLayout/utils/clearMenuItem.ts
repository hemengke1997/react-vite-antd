import { MenuDataItem } from '../typings';

export function clearMenuItem(menusData: MenuDataItem[]): MenuDataItem[] {
  return menusData
    .map((item) => {
      const finalItem = { ...item };
      if (!finalItem.name || finalItem.hideInMenu || finalItem.unaccessible) {
        return null;
      }

      if (finalItem && finalItem?.children) {
        if (
          !finalItem.hideChildrenInMenu &&
          finalItem.children.some(
            (child) => child && child.name && !child.hideInMenu,
          )
        ) {
          return {
            ...item,
            children: clearMenuItem(finalItem.children),
            routes: clearMenuItem(finalItem.routes || []),
          };
        }
        // children 为空就直接删掉
        delete finalItem.children;
      }
      return finalItem;
    })
    .filter((item) => item) as MenuDataItem[];
}
