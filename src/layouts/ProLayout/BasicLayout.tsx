import './BasicLayout.less';
import { CSSProperties } from 'react';
import React, { useContext, useEffect, useMemo } from 'react';
import type { BreadcrumbProps as AntdBreadcrumbProps } from 'antd/lib/breadcrumb';
import { Layout, ConfigProvider } from 'antd';
import classNames from 'classnames';
import warning from 'warning';
import type {
  MenuDataItem,
  ProSettings,
  Route,
  RouterTypes,
  WithFalse,
} from './typings';
import type { GetPageTitleProps } from './getPageTitle';
import { getPageTitleInfo } from './getPageTitle';
import { getBreadcrumbProps } from './utils/getBreadcrumbProps';
import getMenuData from './utils/getMenuData';
import { WaterMarkProps } from './components/WaterMark';
import useDocumentTitle, { isBrowser } from '@/hooks/useDocumentTitle';
import SiderMenu from './components/SiderMenu';
import MenuCounter from './context/MenuContext';
import RouteContext from './context/RouteContext';
import { clearMenuItem } from './utils/clearMenuItem';
import getMatchMenu from './utils/getMatchMenus';
import HeaderView, { HeaderViewProps } from './components/HeaderView';
import { BaseMenuProps } from './components/BaseMenu';
import { omit } from 'lodash-es';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SiderMenuProps } from './components/SiderMenu/SiderMenu';
import useCurrentMenuLayoutProps from './utils/useCurrentMenuLayoutProps';
import useControlledState from '@/hooks/useControlledState';
import { AccessContext, traverseModifyRoutes } from '@/context/useAccess';
import { WithExceptionOpChildren } from './components/WithExceptionChildren';
import getLayoutRenderConfig from './utils/getLayoutRenderConfig';
import PageLoading from '@/components/Loading';
import useGlobalContext from '@/context/useGlobalContext';
import { defaultSettings } from '@/utils/setting';

export type LayoutBreadcrumbProps = {
  minLength?: number;
};

export type BasicLayoutProps = Partial<RouterTypes<Route>> &
  SiderMenuProps &
  HeaderViewProps & {
    pure?: boolean;
    /** @name logo url */
    logo?: React.ReactNode | WithFalse<() => React.ReactNode>;

    /** @name 页面切换的时候触发 */
    onPageChange?: (location?: RouterTypes<Route>['location']) => void;

    onCollapse?: (collapsed: boolean) => void;

    breadcrumbRender?: WithFalse<
      (routers: AntdBreadcrumbProps['routes']) => AntdBreadcrumbProps['routes']
    >;

    menuItemRender?: BaseMenuProps['menuItemRender'];
    pageTitleRender?: WithFalse<
      (
        props: GetPageTitleProps,
        defaultPageTitle?: string,
        info?: {
          // 页面标题
          title: string;
          // 页面标题不带默认的 title
          pageName: string;
        },
      ) => string
    >;
    menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[];
    itemRender?: AntdBreadcrumbProps['itemRender'];

    contentStyle?: CSSProperties;
    isChildrenLayout?: boolean;

    className?: string;

    /** 兼用 content的 margin */
    disableContentMargin?: boolean;

    /** PageHeader 的 BreadcrumbProps 配置，会透传下去 */
    breadcrumbProps?: AntdBreadcrumbProps & LayoutBreadcrumbProps;
    /** @name 水印的相关配置 */
    waterMarkProps?: WaterMarkProps;

    userConfig?: {
      notFound?: React.ReactNode;
      unAccessible?: React.ReactNode;
    };

    loading?: boolean;
  };

/**
 * 渲染头部
 * @param props
 * @param matchMenuKeys
 * @returns
 */
const headerRender = (
  props: BasicLayoutProps & {
    hasSiderMenu: boolean;
  },
  matchMenuKeys: string[],
): React.ReactNode => {
  if (props.headerRender === false || props.pure) {
    return null;
  }

  const clearMenuData = clearMenuItem(props.menuData || []);
  if (clearMenuData && clearMenuData?.length < 1) {
    return null;
  }

  return (
    <HeaderView
      matchMenuKeys={matchMenuKeys}
      {...props}
      menuData={clearMenuData}
    />
  );
};

const renderSiderMenu = (
  props: BasicLayoutProps,
  matchMenuKeys: string[],
): React.ReactNode => {
  const { menuRender } = props;
  if (props.menuRender === false || props.pure) {
    return null;
  }
  let { menuData } = props;

  /** 如果是分割菜单模式，需要专门实现一下 */
  const [key] = matchMenuKeys;
  if (key) {
    menuData = props.menuData?.find((item) => item.key === key)?.children || [];
  } else {
    menuData = [];
  }
  // 这里走了可以少一次循环
  const clearMenuData = clearMenuItem(menuData || []);
  if (clearMenuData && clearMenuData?.length < 1) {
    return null;
  }

  if (menuRender) {
    const defaultDom = (
      <SiderMenu
        matchMenuKeys={matchMenuKeys}
        {...props}
        // 这里走了可以少一次循环
        menuData={clearMenuData}
      />
    );

    return menuRender(props, defaultDom);
  }

  return (
    <SiderMenu
      matchMenuKeys={matchMenuKeys}
      {...props}
      // 这里走了可以少一次循环
      menuData={clearMenuData}
    />
  );
};

const defaultPageTitleRender = (
  pageProps: GetPageTitleProps,
  props: BasicLayoutProps,
): {
  title: string;
  pageName: string;
} => {
  const { pageTitleRender } = props;
  const pageTitleInfo = getPageTitleInfo(pageProps);
  if (pageTitleRender === false) {
    return {
      title: props.title || '',
      pageName: '',
    };
  }
  if (pageTitleRender) {
    const title = pageTitleRender(
      pageProps,
      pageTitleInfo.title,
      pageTitleInfo,
    );
    if (typeof title === 'string') {
      return {
        ...pageTitleInfo,
        title,
      };
    }
    warning(
      typeof title === 'string',
      'pro-layout: renderPageTitle return value should be a string',
    );
  }
  return pageTitleInfo;
};

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumb: Record<string, MenuDataItem>;
};

const getPaddingLeft = (
  collapsed: boolean | undefined,
  siderWidth: number,
): number | undefined => {
  return collapsed ? 48 : siderWidth;
};

/**
 * 🌃 Powerful and easy to use beautiful layout 🏄‍ Support multiple topics and layout types
 *
 * @param props
 */
const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    children,
    onCollapse: propsOnCollapse,
    location = { pathname: '/' },
    contentStyle,
    route,
    defaultCollapsed,
    style,
    siderWidth = 208,
    menu,
    menuDataRender,
    userConfig,
    loading,
  } = props || {};

  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = props.prefixCls ?? context.getPrefixCls('pro');

  const { initialState } = useGlobalContext.usePicker(['initialState']);

  const accessContext = React.useContext(AccessContext);

  const menuInfoData = useMemo(
    () => getMenuData(route?.routes || [], menuDataRender),
    [route, menuDataRender],
  );

  const {
    breadcrumb = {},
    breadcrumbMap,
    menuData: menuDataT = [],
    originalMenuData = [],
  } = menuInfoData || {};

  const menuData = useMemo(() => {
    return traverseModifyRoutes(menuDataT, accessContext);
  }, [menuDataT, accessContext]);

  const currentPathConfig = useMemo(() => {
    // 动态路由匹配
    return getMatchMenu(location.pathname!, originalMenuData).pop();
  }, [location?.pathname, menuDataT]);

  const matchMenus = useMemo(() => {
    return getMatchMenu(location.pathname || '/', menuData || [], true);
  }, [location.pathname, menuData]);

  const matchMenuKeys = useMemo(
    () =>
      Array.from(
        new Set(matchMenus.map((item) => item.key || item.path || '')),
      ),
    [matchMenus],
  );

  // 当前选中的menu，一般不会为空
  const currentMenu = (matchMenus[matchMenus.length - 1] || {}) as ProSettings &
    MenuDataItem;

  const currentMenuLayoutProps = useCurrentMenuLayoutProps(currentMenu);

  const { fixSiderbar } = {
    ...props,
    ...currentMenuLayoutProps,
  };

  const [collapsed, onCollapse] = useControlledState<boolean>(
    () => defaultCollapsed || false,
    {
      value: props.collapsed,
      onChange: propsOnCollapse,
    },
  );

  // Splicing parameters, adding menuData in props
  const defaultProps = omit(
    {
      prefixCls,
      ...props,
      siderWidth,
      ...currentMenuLayoutProps,
      breadcrumb,
      menu,
      ...getLayoutRenderConfig(currentPathConfig as any),
    },
    ['className', 'style', 'breadcrumbRender'],
  );

  // gen page title
  const pageTitleInfo = defaultPageTitleRender(
    {
      pathname: location.pathname,
      ...defaultProps,
      breadcrumbMap,
    },
    props,
  );

  // gen breadcrumbProps, parameter for pageHeader
  const breadcrumbProps = getBreadcrumbProps(
    {
      ...defaultProps,
      breadcrumbRender: props.breadcrumbRender,
      breadcrumbMap,
    },
    props,
  );

  // render sider dom
  const siderMenuDom = renderSiderMenu(
    {
      ...defaultProps,
      menuData,
      onCollapse,
      collapsed,
    },
    matchMenuKeys,
  );

  // render header dom
  const headerDom = headerRender(
    {
      ...defaultProps,
      hasSiderMenu: !!siderMenuDom,
      menuData,
      collapsed,
      onCollapse,
    },
    matchMenuKeys,
  );

  const baseClassName = `${prefixCls}-basicLayout`;
  // gen className
  const className = classNames(
    props.className,
    baseClassName,
    `${baseClassName}-mix`,
    [`${baseClassName}-is-children`],
    {
      [`${baseClassName}-fix-siderbar`]: fixSiderbar,
    },
  );

  /** 计算 slider 的宽度 */
  const leftSiderWidth = getPaddingLeft(collapsed, siderWidth);

  // siderMenuDom 为空的时候，不需要 padding
  const genLayoutStyle: CSSProperties = {
    position: 'relative',
  };

  // if is some layout children, don't need min height
  if (contentStyle && contentStyle.minHeight) {
    genLayoutStyle.minHeight = 0;
  }

  const contentClassName = classNames(`${baseClassName}-content`, {
    [`${baseClassName}-has-header`]: headerDom,
  });

  /** 页面切换的时候触发 */
  useEffect(() => {
    props.onPageChange?.(props.location);
  }, [location.pathname, location.pathname?.search]);

  useDocumentTitle(pageTitleInfo, props.title || false);

  return (
    <MenuCounter.Provider>
      <RouteContext.Provider
        value={{
          ...defaultProps,
          breadcrumb: breadcrumbProps,
          menuData,
          collapsed,
          title: pageTitleInfo.pageName,
          hasSiderMenu: !!siderMenuDom,
          hasHeader: !!headerDom,
          siderWidth: leftSiderWidth,
          pageTitleInfo,
          matchMenus,
          matchMenuKeys,
          currentMenu,
        }}
      >
        <WithExceptionOpChildren
          notFound={userConfig?.notFound}
          unAccessible={userConfig?.unAccessible}
          currentPathConfig={currentPathConfig}
        >
          {props.pure ? (
            children
          ) : (
            <div className={className}>
              <Layout
                style={{
                  minHeight: '100%',
                  ...style,
                }}
              >
                {siderMenuDom}
                <div
                  style={genLayoutStyle}
                  className={context.getPrefixCls('layout')}
                >
                  {headerDom}
                  {loading || initialState.loading ? (
                    <PageLoading spin />
                  ) : (
                    <ErrorBoundary>
                      <Layout.Content
                        className={contentClassName}
                        style={contentStyle}
                      >
                        {children}
                      </Layout.Content>
                    </ErrorBoundary>
                  )}
                </div>
              </Layout>
            </div>
          )}
        </WithExceptionOpChildren>
      </RouteContext.Provider>
    </MenuCounter.Provider>
  );
};

BasicLayout.defaultProps = {
  ...defaultSettings,
  location: isBrowser() ? window.location : undefined,
};

export default BasicLayout;
