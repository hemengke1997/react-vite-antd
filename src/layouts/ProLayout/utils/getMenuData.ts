import type { MenuDataItem, Route } from '../typings';
import memoizeOne from 'memoize-one';
import { isEqual } from 'lodash';
import { mergePath } from '../renderer-react/renderRoutes';
import sha265 from './sha265';

interface FormatterProps {
  data: Route[];
  [key: string]: any;
}

export function stripQueryStringAndHashFromPath(url: string) {
  return url.split('?')[0].split('#')[0];
}

export const getKeyByPath = (item: MenuDataItem) => {
  const { path } = item;
  if (
    !path
    // || path === '/'
  ) {
    // 如果还是没有，用对象的hash 生成一个
    try {
      return `/${sha265(JSON.stringify(item))}`;
    } catch (error) {
      // dom some thing
    }
  }

  return path ? stripQueryStringAndHashFromPath(path) : path;
};

/**
 * 删除 hideInMenu 和 item.name 不存在的
 */
const defaultFilterMenuData = (menuData: MenuDataItem[] = []): MenuDataItem[] =>
  menuData
    .filter(
      (item: MenuDataItem) =>
        item && (item.name || item.children) && !item.hideInMenu,
    )
    .map((item: MenuDataItem) => {
      if (
        item.children &&
        Array.isArray(item.children) &&
        !item.hideChildrenInMenu &&
        item.children.some((child: MenuDataItem) => child && !!child.name)
      ) {
        const children = defaultFilterMenuData(item.children);
        if (children.length) return { ...item, children };
      }
      return { ...item, children: undefined };
    })
    .filter((item) => item);

/**
 * 获取面包屑映射
 * @param MenuDataItem[] menuData 菜单配置
 */
const getBreadcrumbNameMap = (
  menuData: MenuDataItem[],
): Map<string, MenuDataItem> => {
  // Map is used to ensure the order of keys
  const routerMap = new Map<string, MenuDataItem>();
  const flattenMenuData = (data: MenuDataItem[], parent?: MenuDataItem) => {
    data.forEach((menuItem) => {
      if (menuItem && menuItem.children) {
        flattenMenuData(menuItem.children, menuItem);
      }
      // Reduce memory usage
      const path = mergePath(menuItem.path, parent ? parent.path : '/');
      routerMap.set(stripQueryStringAndHashFromPath(path), menuItem);
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

const memoizeOneGetBreadcrumbNameMap = memoizeOne(
  getBreadcrumbNameMap,
  isEqual,
);

/**
 * @param routes 路由配置
 * @param ignoreFilter 是否筛选掉不展示的 menuItem 项，plugin-layout需要所有项目来计算布局样式
 * @returns { breadcrumb, menuData}
 */
const transformRoute = (
  routes: Route[],
): {
  breadcrumb: Map<string, MenuDataItem>;
  menuData: MenuDataItem[];
} => {
  const originalMenuData = memoizeOneFormatter({
    data: routes,
  });

  const menuData = defaultFilterMenuData(originalMenuData);

  // Map type used for internal logic
  const breadcrumb = memoizeOneGetBreadcrumbNameMap(originalMenuData);

  return { breadcrumb, menuData };
};

function formatter(
  props: FormatterProps,
  parent: Partial<Route> = { path: '/' },
): MenuDataItem[] {
  const { data } = props;
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data
    .filter((item) => {
      if (!item) return false;
      if (item.path === '*') return true;
      if (item.routes || item.children) return true;
      if (item.path) return true;
      // 重定向
      if (item.redirect) return false;
      return false;
    })
    .map((item = { path: '/' }) => {
      const path = mergePath(item.path, parent ? parent.path : '/');

      const { parentKeys = [], children, icon, ...restParent } = parent;

      const finallyItem: Route = {
        ...restParent,
        ...item,
        path,
        key: item.key || getKeyByPath({ ...item, path }),
        routes: undefined,
        component: undefined,
        parentKeys: Array.from(
          new Set([
            ...(item.parentKeys || []),
            ...parentKeys,
            `/${parent.key || ''}`.replace(/\/\//g, '/').replace(/\/\//g, '/'),
          ]),
        ).filter((key) => key && key !== '/'),
      };

      if (item.routes || item.children) {
        const formatterChildren = formatter(
          {
            ...props,
            data: item.routes! || item.children!,
          },
          finallyItem,
        );
        // Reduce memory usage
        finallyItem.children =
          formatterChildren && formatterChildren.length > 0
            ? formatterChildren
            : undefined;

        if (!finallyItem.children) {
          delete finallyItem.children;
        }
      }

      return finallyItem;
    });
}

function fromEntries(iterable: any) {
  return [...iterable].reduce(
    (obj: Record<string, MenuDataItem>, [key, val]) => {
      obj[key] = val;
      return obj;
    },
    {},
  );
}

export default (
  routes: Route[],
  menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[],
) => {
  const { menuData, breadcrumb } = transformRoute(routes);
  if (!menuDataRender) {
    return {
      breadcrumb: fromEntries(breadcrumb),
      breadcrumbMap: breadcrumb,
      menuData,
    };
  }
  const renderData = transformRoute(menuDataRender(menuData));
  return {
    breadcrumb: fromEntries(renderData.breadcrumb),
    breadcrumbMap: renderData.breadcrumb,
    menuData: renderData.menuData,
  };
};
