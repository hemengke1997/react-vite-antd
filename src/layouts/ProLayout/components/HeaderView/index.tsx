import './index.less';

import React from 'react';
import classNames from 'classnames';
import { Layout } from 'antd';
import { MenuDataItem, PureSettings, WithFalse } from '../../typings';
import { clearMenuItem } from '../../utils/clearMenuItem';
import { PrivateSiderMenuProps, SiderMenuProps } from '../SiderMenu/SiderMenu';
import TopNavHeader from '../TopNavHeader';

const { Header } = Layout;

export type HeaderViewProps = {
  collapsed?: boolean;
  logo?: React.ReactNode;
  headerRender?: WithFalse<
    (props: HeaderViewProps, defaultDom: React.ReactNode) => React.ReactNode
  >;
  headerTitleRender?: WithFalse<
    (
      logo: React.ReactNode,
      title: React.ReactNode,
      props: HeaderViewProps,
    ) => React.ReactNode
  >;
  headerContentRender?: WithFalse<(props: HeaderViewProps) => React.ReactNode>;
  siderWidth?: number;
  hasSiderMenu?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  menuRender?: WithFalse<
    (props: HeaderViewProps, defaultDom: React.ReactNode) => React.ReactNode
  >;
  rightContentRender?: WithFalse<(props: HeaderViewProps) => React.ReactNode>;
  className?: string;
  prefixCls?: string;
  menuData?: MenuDataItem[];
  onMenuHeaderClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  menuHeaderRender?: SiderMenuProps['menuHeaderRender'];
  collapsedButtonRender?: SiderMenuProps['collapsedButtonRender'];
} & Partial<PureSettings>;

const HeaderView: React.FC<HeaderViewProps & PrivateSiderMenuProps> = (
  props,
) => {
  const {
    menuData,
    headerRender,
    headerContentRender,
    className: propsClassName,
    style,
    collapsed,
    prefixCls,
    headerHeight,
  } = props;

  const renderContent = () => {
    const menuDataT = clearMenuItem(menuData || []);

    const noChildrenMenuData = (menuDataT || []).map((item) => ({
      ...item,
      children: undefined,
    }));
    const clearMenuData = clearMenuItem(noChildrenMenuData);

    const defaultDom = (
      <TopNavHeader mode="horizontal" {...props} menuData={clearMenuData}>
        {headerContentRender && headerContentRender(props)}
      </TopNavHeader>
    );

    if (headerRender && typeof headerRender === 'function') {
      return headerRender(props, defaultDom);
    }
    return defaultDom;
  };

  const className = classNames(propsClassName, {
    [`${prefixCls}-fixed-header`]: true,
    [`${prefixCls}-fixed-header-action`]: !collapsed,
  });

  return (
    <>
      <Header
        style={{
          height: headerHeight,
          lineHeight: `${headerHeight}px`,
          background: 'transparent',
        }}
      />
      <Header
        style={{
          padding: 0,
          height: headerHeight,
          lineHeight: `${headerHeight}px`,
          width: '100%',
          zIndex: 100,
          right: 0,
          ...style,
        }}
        className={className}
      >
        {renderContent()}
      </Header>
    </>
  );
};

export default HeaderView;
