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
import defaultSettings from './defaultSettings';
import { clearMenuItem } from './utils/clearMenuItem';
import getMatchMenu from './utils/getMatchMenus';
import HeaderView, { HeaderViewProps } from './components/HeaderView';
import { BaseMenuProps } from './components/BaseMenu';
import { omit } from 'lodash';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SiderMenuProps } from './components/SiderMenu/SiderMenu';
import useCurrentMenuLayoutProps from './utils/useCurrentMenuLayoutProps';
import useControlledState from '@/hooks/useControlledState';
import { AccessContext, traverseModifyRoutes } from '@/context/useAccess';
import { WithExceptionOpChildren } from './components/WithExceptionChildren';
import getLayoutRenderConfig from './utils/getLayoutRenderConfig';
import PageLoading from '@/components/Loading';
import useGlobalContext from '@/context/useGlobalContext';

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
  return <HeaderView matchMenuKeys={matchMenuKeys} {...props} />;
};

const renderSiderMenu = (
  props: BasicLayoutProps,
  matchMenuKeys: string[],
): React.ReactNode => {
  const { menuRender, openKeys } = props;
  if (props.menuRender === false || props.pure) {
    return null;
  }
  let { menuData } = props;

  /** 如果是分割菜单模式，需要专门实现一下 */
  if (openKeys !== false) {
    const [key] = matchMenuKeys;
    if (key) {
      menuData =
        props.menuData?.find((item) => item.key === key)?.children || [];
    } else {
      menuData = [];
    }
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
  } = menuInfoData || {};

  const menuData = useMemo(() => {
    return traverseModifyRoutes(menuDataT, accessContext);
  }, [menuDataT, accessContext]);

  const currentPathConfig = useMemo(() => {
    // 动态路由匹配
    return getMatchMenu(location.pathname!, menuDataT).pop();
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

const Logo = () => (
  <svg width="32px" height="32px" viewBox="0 0 200 200">
    <defs>
      <linearGradient
        x1="62.1023273%"
        y1="0%"
        x2="108.19718%"
        y2="37.8635764%"
        id="linearGradient-1"
      >
        <stop stopColor="#4285EB" offset="0%" />
        <stop stopColor="#2EC7FF" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="69.644116%"
        y1="0%"
        x2="54.0428975%"
        y2="108.456714%"
        id="linearGradient-2"
      >
        <stop stopColor="#29CDFF" offset="0%" />
        <stop stopColor="#148EFF" offset="37.8600687%" />
        <stop stopColor="#0A60FF" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="69.6908165%"
        y1="-12.9743587%"
        x2="16.7228981%"
        y2="117.391248%"
        id="linearGradient-3"
      >
        <stop stopColor="#FA816E" offset="0%" />
        <stop stopColor="#F74A5C" offset="41.472606%" />
        <stop stopColor="#F51D2C" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="68.1279872%"
        y1="-35.6905737%"
        x2="30.4400914%"
        y2="114.942679%"
        id="linearGradient-4"
      >
        <stop stopColor="#FA8E7D" offset="0%" />
        <stop stopColor="#F74A5C" offset="51.2635191%" />
        <stop stopColor="#F51D2C" offset="100%" />
      </linearGradient>
    </defs>
    <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
      <g transform="translate(-20.000000, -20.000000)">
        <g transform="translate(20.000000, 20.000000)">
          <g>
            <g fillRule="nonzero">
              <g>
                <path
                  d="M91.5880863,4.17652823 L4.17996544,91.5127728 C-0.519240605,96.2081146 -0.519240605,103.791885 4.17996544,108.487227 L91.5880863,195.823472 C96.2872923,200.518814 103.877304,200.518814 108.57651,195.823472 L145.225487,159.204632 C149.433969,154.999611 149.433969,148.181924 145.225487,143.976903 C141.017005,139.771881 134.193707,139.771881 129.985225,143.976903 L102.20193,171.737352 C101.032305,172.906015 99.2571609,172.906015 98.0875359,171.737352 L28.285908,101.993122 C27.1162831,100.824459 27.1162831,99.050775 28.285908,97.8821118 L98.0875359,28.1378823 C99.2571609,26.9692191 101.032305,26.9692191 102.20193,28.1378823 L129.985225,55.8983314 C134.193707,60.1033528 141.017005,60.1033528 145.225487,55.8983314 C149.433969,51.69331 149.433969,44.8756232 145.225487,40.6706018 L108.58055,4.05574592 C103.862049,-0.537986846 96.2692618,-0.500797906 91.5880863,4.17652823 Z"
                  fill="url(#linearGradient-1)"
                />
                <path
                  d="M91.5880863,4.17652823 L4.17996544,91.5127728 C-0.519240605,96.2081146 -0.519240605,103.791885 4.17996544,108.487227 L91.5880863,195.823472 C96.2872923,200.518814 103.877304,200.518814 108.57651,195.823472 L145.225487,159.204632 C149.433969,154.999611 149.433969,148.181924 145.225487,143.976903 C141.017005,139.771881 134.193707,139.771881 129.985225,143.976903 L102.20193,171.737352 C101.032305,172.906015 99.2571609,172.906015 98.0875359,171.737352 L28.285908,101.993122 C27.1162831,100.824459 27.1162831,99.050775 28.285908,97.8821118 L98.0875359,28.1378823 C100.999864,25.6271836 105.751642,20.541824 112.729652,19.3524487 C117.915585,18.4685261 123.585219,20.4140239 129.738554,25.1889424 C125.624663,21.0784292 118.571995,14.0340304 108.58055,4.05574592 C103.862049,-0.537986846 96.2692618,-0.500797906 91.5880863,4.17652823 Z"
                  fill="url(#linearGradient-2)"
                />
              </g>
              <path
                d="M153.685633,135.854579 C157.894115,140.0596 164.717412,140.0596 168.925894,135.854579 L195.959977,108.842726 C200.659183,104.147384 200.659183,96.5636133 195.960527,91.8688194 L168.690777,64.7181159 C164.472332,60.5180858 157.646868,60.5241425 153.435895,64.7316526 C149.227413,68.936674 149.227413,75.7543607 153.435895,79.9593821 L171.854035,98.3623765 C173.02366,99.5310396 173.02366,101.304724 171.854035,102.473387 L153.685633,120.626849 C149.47715,124.83187 149.47715,131.649557 153.685633,135.854579 Z"
                fill="url(#linearGradient-3)"
              />
            </g>
            <ellipse
              fill="url(#linearGradient-4)"
              cx="100.519339"
              cy="100.436681"
              rx="23.6001926"
              ry="23.580786"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

BasicLayout.defaultProps = {
  logo: <Logo />,
  ...defaultSettings,
  location: isBrowser() ? window.location : undefined,
};

export default BasicLayout;
