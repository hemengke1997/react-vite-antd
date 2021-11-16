import { CSSProperties, useMemo, useState } from 'react';
import React from 'react';
import { Layout, Menu, Tooltip } from 'antd';
import classNames from 'classnames';
import type { SiderProps } from 'antd/lib/layout/Sider';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import './index.less';
import type { WithFalse } from '../../typings';
import BaseMenu, { BaseMenuProps } from '../BaseMenu';
import MenuContext from '../../context/MenuContext';
import { Link } from 'react-router-dom';
const { Sider } = Layout;

export type SiderMenuProps = {
  logo?: React.ReactNode;
  siderWidth?: number;
  menuHeaderRender?: WithFalse<
    (
      logo: React.ReactNode,
      title: React.ReactNode,
      props?: SiderMenuProps,
    ) => React.ReactNode
  >;
  menuFooterRender?: WithFalse<(props?: SiderMenuProps) => React.ReactNode>;
  menuContentRender?: WithFalse<
    (props: SiderMenuProps, defaultDom: React.ReactNode) => React.ReactNode
  >;
  menuExtraRender?: WithFalse<(props: SiderMenuProps) => React.ReactNode>;
  collapsedButtonRender?: WithFalse<(collapsed?: boolean) => React.ReactNode>;
  breakpoint?: SiderProps['breakpoint'] | false;
  onMenuHeaderClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  hide?: boolean;
  className?: string;
  style?: CSSProperties;
  links?: React.ReactNode[];
  onOpenChange?: (openKeys: WithFalse<string[]>) => void;
  getContainer?: false;
  logoStyle?: CSSProperties;
} & Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>>;

export const defaultRenderCollapsedButton = (collapsed?: boolean) =>
  collapsed ? (
    <Tooltip title="固定" placement="right">
      <MenuUnfoldOutlined />
    </Tooltip>
  ) : (
    <Tooltip title="收起" placement="right">
      <MenuFoldOutlined />
    </Tooltip>
  );

export type PrivateSiderMenuProps = {
  matchMenuKeys: string[];
};

const SiderMenu: React.FC<SiderMenuProps & PrivateSiderMenuProps> = (props) => {
  const {
    collapsed: propsCollapsed,
    fixSiderbar,
    menuFooterRender,
    onCollapse,
    siderWidth,
    breakpoint = 'lg',
    style,
    menuExtraRender = false,
    collapsedButtonRender = defaultRenderCollapsedButton,
    links,
    menuContentRender,
    prefixCls,
    onOpenChange,
    headerHeight,
  } = props;

  const baseClassName = `${prefixCls}-sider`;
  const { flatMenuKeys } = MenuContext.useContainer();
  const siderClassName = classNames(`${baseClassName}`, {
    [`${baseClassName}-fixed`]: fixSiderbar,
    [`${baseClassName}-layout-mix`]: true,
    [`${baseClassName}-light`]: true,
  });

  const extraDom = menuExtraRender && menuExtraRender(props);
  const menuDom = menuContentRender !== false && flatMenuKeys && (
    <BaseMenu
      {...props}
      key="base-menu"
      mode="inline"
      handleOpenChange={onOpenChange}
      style={{
        width: '100%',
      }}
      className={`${baseClassName}-menu`}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }
        if (menuItemProps.path && location.pathname !== menuItemProps.path) {
          return (
            <Link to={menuItemProps.path} target={menuItemProps.target}>
              {defaultDom}
            </Link>
          );
        }
        return defaultDom;
      }}
    />
  );

  const menuRenderDom = menuContentRender
    ? menuContentRender(props, menuDom)
    : menuDom;

  const [fixedCollapsed, setFixedCollapse] = useState<boolean>(false);

  const collapsed = useMemo(() => {
    // closed
    if (propsCollapsed) {
      return fixedCollapsed;
    }
    return propsCollapsed;
  }, [propsCollapsed, fixedCollapsed]);

  return (
    <>
      {fixSiderbar && (
        <div
          style={{
            width: propsCollapsed ? 48 : siderWidth,
            overflow: 'hidden',
            flex: `0 0 ${propsCollapsed ? 48 : siderWidth}px`,
            maxWidth: propsCollapsed ? 48 : siderWidth,
            minWidth: propsCollapsed ? 48 : siderWidth,
            ...style,
          }}
        />
      )}
      <Sider
        collapsible
        trigger={null}
        collapsed={collapsed}
        breakpoint={breakpoint === false ? undefined : breakpoint}
        onCollapse={(collapse) => {
          onCollapse?.(collapse);
        }}
        collapsedWidth={48}
        style={{
          overflow: 'hidden',
          paddingTop: headerHeight,
          ...style,
        }}
        width={siderWidth}
        className={siderClassName}
        onMouseEnter={() => {
          if (propsCollapsed) {
            setFixedCollapse(false);
          }
        }}
        onMouseLeave={() => {
          if (propsCollapsed) {
            setFixedCollapse(true);
          }
        }}
      >
        {extraDom && (
          <div
            className={`${baseClassName}-extra ${`${baseClassName}-extra-no-logo`}`}
          >
            {extraDom}
          </div>
        )}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {menuRenderDom}
        </div>
        <div className={`${baseClassName}-links`}>
          <Menu
            theme="light"
            inlineIndent={16}
            className={`${baseClassName}-link-menu`}
            selectedKeys={[]}
            openKeys={[]}
            mode="inline"
          >
            {(links || []).map((node, index) => (
              <Menu.Item className={`${baseClassName}-link`} key={index}>
                {node}
              </Menu.Item>
            ))}
            {collapsedButtonRender && (
              <Menu.Item
                className={`${baseClassName}-collapsed-button`}
                title={false}
                key="collapsed"
                onClick={() => {
                  if (onCollapse) {
                    onCollapse(!propsCollapsed);
                  }
                }}
              >
                {collapsedButtonRender(propsCollapsed)}
              </Menu.Item>
            )}
          </Menu>
        </div>
        {menuFooterRender && (
          <div
            className={classNames(`${baseClassName}-footer`, {
              [`${baseClassName}-footer-collapsed`]: !propsCollapsed,
            })}
          >
            {menuFooterRender(props)}
          </div>
        )}
      </Sider>
    </>
  );
};

export default SiderMenu;
