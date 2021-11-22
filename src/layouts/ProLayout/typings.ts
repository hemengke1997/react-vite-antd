import React from 'react';
import type { LoadableComponent } from '@loadable/component';

import type { RouteComponentProps, match } from 'react-router-dom';

export type MenuDataItem<T extends any = any> = {
  /** @name 子菜单 */
  routes?: MenuDataItem[];
  children?: MenuDataItem[];
  /** @name 在菜单中隐藏子节点 */
  hideChildrenInMenu?: boolean;
  /** @name 在菜单中隐藏自己和子节点 */
  hideInMenu?: boolean;
  /** @name 在面包屑中隐藏 */
  hideInBreadcrumb?: boolean;
  /** @name 菜单的icon */
  icon?: React.ReactNode;
  extraIcon?: React.ReactNode;
  /** @name 菜单的名字 */
  name?: string;
  /** @name 用于标定选中的值，默认是 path */
  key?: string;
  /** @name disable 菜单选项 */
  disabled?: boolean;
  /** @name 路径,可以设定为网页链接 */
  /** @name 点击菜单 */
  onTitleClick?: () => void;
  path?: string;
  /**
   * 当此节点被选中的时候也会选中 parentKeys 的节点
   *
   * @name 自定义父节点
   */
  parentKeys?: string[];
  /** @name 隐藏自己，并且将子节点提升到与自己平级 */
  flatMenu?: boolean;
  /** @name 指定外链打开形式，同a标签 */
  target?: string;
  /** @name 路由鉴权，是否需要登录 */
  auth?: boolean;
  /** @name 路由权限 */
  access?: string;
  /** @name 路由可否访问 */
  unaccessible?: boolean;
  /** @name 重定向 */
  redirect?: string;
  /** @name 组件路径 */
  component?: LoadableComponent<T>;
  exact?: boolean | undefined;
  sensitive?: boolean | undefined;
  strict?: boolean | undefined;
};

export type WithFalse<T> = T | false;

export type Route = {
  routes?: Route[];
  layout?: WithFalse<{
    hasSiderMenu?: boolean;
    hasTopMenu?: boolean;
  }>;
} & MenuDataItem;

export type RouterTypes<P> = {
  computedMatch?: match<P>;
  route?: Route;
  location: RouteComponentProps['location'] | { pathname?: string };
} & Omit<RouteComponentProps, 'location'>;

export type ContentWidth = 'Fluid' | 'Fixed';

export type RenderSetting = {
  headerRender?: false;
  menuRender?: false;
  menuHeaderRender?: false;
};
export type PureSettings = {
  title?: WithFalse<string>;
  /** @name customize header height */
  headerHeight?: number;
  /** @name layout of content: `Fluid` or `Fixed`, only works when layout is top */
  contentWidth?: ContentWidth;
  /** @name sticky header */
  fixedHeader?: boolean;
  /** @name sticky siderbar */
  fixSiderbar?: boolean;
  /** @name menu 相关的一些配置 */
  menu?: {
    defaultOpenAll?: boolean;
    ignoreFlatMenu?: boolean; // 是否忽略用户手动折叠过的菜单状态，如选择忽略，折叠按钮切换之后也可实现展开所有菜单
    autoClose?: false;
  };
  /**
   * Your custom iconfont Symbol script Url eg：//at.alicdn.com/t/font_1039637_btcrd5co4w.js
   * 注意：如果需要图标多色，Iconfont 图标项目里要进行批量去色处理 Usage: https://github.com/ant-design/ant-design-pro/pull/3517
   */
  iconfontUrl?: string;
  /**
   * 只在 mix 模式下生效
   * @name 切割菜单
   */
  splitMenus?: boolean;
};

export type ProSettings = PureSettings & RenderSetting;
