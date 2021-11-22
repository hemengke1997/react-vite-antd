import type { MenuDataItem, ProSettings } from './typings';
import { pathToRegexp } from 'path-to-regexp';

export const matchParamsPath = (
  pathname: string,
  breadcrumb?: Record<string, MenuDataItem>,
  breadcrumbMap?: Map<string, MenuDataItem>,
): MenuDataItem => {
  // Internal logic use breadcrumbMap to ensure the order
  // 内部逻辑使用 breadcrumbMap 来确保查询顺序
  if (breadcrumbMap) {
    const pathKey = [...breadcrumbMap.keys()].find((key) => {
      return pathToRegexp(key).test(pathname);
    });
    if (pathKey) {
      return breadcrumbMap.get(pathKey) as MenuDataItem;
    }
  }

  // External uses use breadcrumb
  // 外部用户使用 breadcrumb 参数
  if (breadcrumb) {
    const pathKey = Object.keys(breadcrumb).find((key) =>
      pathToRegexp(key).test(pathname),
    );

    if (pathKey) {
      return breadcrumb[pathKey];
    }
  }

  return {
    path: '',
  };
};

export type GetPageTitleProps = {
  pathname?: string;
  breadcrumb?: Record<string, MenuDataItem>;
  breadcrumbMap?: Map<string, MenuDataItem>;
  menu?: ProSettings['menu'];
  title?: ProSettings['title'];
  pageName?: string;
};

/**
 * 获取关于 pageTitle 的所有信息方便包装
 *
 * @param props
 * @param ignoreTitle
 */
const getPageTitleInfo = (
  props: GetPageTitleProps,
  ignoreTitle?: boolean,
): {
  // 页面标题
  title: string;
  // 页面标题不带默认的 title
  pageName: string;
} => {
  const { pathname = '/', breadcrumb, breadcrumbMap, title = '' } = props;
  const pageTitle = ignoreTitle ? '' : title || '';
  const currRouterData = matchParamsPath(pathname, breadcrumb, breadcrumbMap);
  if (!currRouterData) {
    return {
      title: pageTitle,
      pageName: pageTitle,
    };
  }
  let pageName = currRouterData.name;

  if (!pageName) {
    return {
      title: pageTitle,
      pageName: pageTitle,
    };
  }
  if (ignoreTitle || !title) {
    return {
      title: pageName,
      pageName,
    };
  }
  return {
    title: `${pageName} - ${title}`,
    pageName,
  };
};

export { getPageTitleInfo };

const getPageTitle = (props: GetPageTitleProps, ignoreTitle?: boolean) => {
  return getPageTitleInfo(props, ignoreTitle).title;
};

export default getPageTitle;
