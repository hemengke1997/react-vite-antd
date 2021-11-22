import Icon, { createFromIconfontCN } from '@ant-design/icons';
import { Menu } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';

import type { MenuProps } from 'antd';
import type { PureSettings } from '../../defaultSettings';

import type {
  MenuDataItem,
  Route,
  RouterTypes,
  WithFalse,
} from '../../typings';
import isUrl from '../../utils/isUrl';
import isImg from '../../utils/isImg';
import useMountControlledState from '@/hooks/useMountControlledState';
import type { PrivateSiderMenuProps } from '../SiderMenu/SiderMenu';
import { defaultSettings } from '@/utils/setting';

// todo
export type MenuMode =
  | 'vertical'
  | 'vertical-left'
  | 'vertical-right'
  | 'horizontal'
  | 'inline';

export type BaseMenuProps = {
  className?: string;
  /** 默认的是否展开，会受到 breakpoint 的影响 */
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  menuData?: MenuDataItem[];
  mode?: MenuMode;
  onCollapse?: (collapsed: boolean) => void;
  handleOpenChange?: (openKeys: string[]) => void;
  iconPrefixes?: string;
  /** 要给菜单的props, 参考antd-menu的属性。https://ant.design/components/menu-cn/ */
  menuProps?: MenuProps;
  style?: React.CSSProperties;
  subMenuItemRender?: WithFalse<
    (
      item: MenuDataItem & {
        isUrl: boolean;
      },
      defaultDom: React.ReactNode,
    ) => React.ReactNode
  >;
  menuItemRender?: WithFalse<
    (
      item: MenuDataItem & {
        isUrl: boolean;
        onClick: () => void;
      },
      defaultDom: React.ReactNode,
      menuProps: BaseMenuProps,
    ) => React.ReactNode
  >;
  postMenuData?: (menusData?: MenuDataItem[]) => MenuDataItem[];
} & Partial<RouterTypes<Route>> &
  Omit<MenuProps, 'openKeys' | 'onOpenChange' | 'title' | 'theme'> &
  Partial<PureSettings>;

const { SubMenu, ItemGroup } = Menu;

let IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'icon-geren' #For Iconfont ,
//   icon: 'http://demo.com/icon.png',
//   icon: '/favicon.png',
//   icon: <Icon type="setting" />,
const getIcon = (
  icon?: string | React.ReactNode,
  iconPrefixes: string = 'icon-',
): React.ReactNode => {
  if (typeof icon === 'string' && icon !== '') {
    if (isUrl(icon) || isImg(icon)) {
      return (
        <Icon
          component={() => (
            <img src={icon} alt="icon" className="ant-pro-sider-menu-icon" />
          )}
        />
      );
    }
    if (icon.startsWith(iconPrefixes)) {
      return <IconFont type={icon} />;
    }
  }
  return icon;
};

class MenuUtil {
  constructor(props: BaseMenuProps) {
    this.props = props;
  }

  props: BaseMenuProps;

  getNavMenuItems = (
    menusData: MenuDataItem[] = [],
    isChildren: boolean,
  ): React.ReactNode[] =>
    menusData
      .map((item) => this.getSubMenuOrItem(item, isChildren))
      .filter((item) => item);

  /** Get SubMenu or Item */
  getSubMenuOrItem = (
    item: MenuDataItem,
    isChildren: boolean,
  ): React.ReactNode => {
    const { mode, prefixCls } = this.props;

    if (Array.isArray(item.children) && item && item.children.length > 0) {
      const name = item.name;
      const { subMenuItemRender, menu, iconPrefixes } = this.props;
      //  get defaultTitle by menuItemRender
      const defaultTitle = item.icon ? (
        <span className={`${prefixCls}-menu-item`} title={name}>
          {!isChildren && getIcon(item.icon, iconPrefixes)}
          <span className={`${prefixCls}-menu-item-title`}>{name}</span>
        </span>
      ) : (
        <span className={`${prefixCls}-menu-item`} title={name}>
          {name}
        </span>
      );

      // subMenu only title render
      const title = subMenuItemRender
        ? subMenuItemRender({ ...item, isUrl: false }, defaultTitle)
        : defaultTitle;
      const MenuComponents: React.ElementType =
        menu?.type === 'group' ? ItemGroup : SubMenu;
      return (
        <MenuComponents
          title={title}
          key={item.key || item.path}
          onTitleClick={item.onTitleClick}
        >
          {this.getNavMenuItems(item.children, true)}
        </MenuComponents>
      );
    }

    return (
      <Menu.Item
        disabled={item.disabled}
        key={item.path}
        onClick={item.onTitleClick}
        style={{
          cursor: mode === 'horizontal' ? 'default' : 'pointer',
        }}
        className={`${prefixCls}-menu-li`}
      >
        {this.getMenuItemPath(item, isChildren)}
      </Menu.Item>
    );
  };

  /**
   * 判断是否是http链接.返回 Link 或 a Judge whether it is http link.return a or Link
   *
   * @memberof SiderMenu
   */
  getMenuItemPath = (item: MenuDataItem, isChildren: boolean) => {
    const itemPath = this.conversionPath(item.path || '/');
    const {
      location = { pathname: '/' },
      onCollapse,
      menuItemRender,
      iconPrefixes,
    } = this.props;
    // if local is true formatMessage all name。
    const name = item.name;
    const { prefixCls } = this.props;
    const icon = isChildren ? null : getIcon(item.icon, iconPrefixes);
    let defaultItem = (
      <span className={`${prefixCls}-menu-item`}>
        {icon}
        <span className={`${prefixCls}-menu-item-title`}>{name}</span>
      </span>
    );

    const isHttpUrl = isUrl(itemPath);

    // Is it a http link
    if (isHttpUrl) {
      defaultItem = (
        <span
          title={name}
          className={`${prefixCls}-menu-item ${prefixCls}-menu-item-link`}
        >
          {icon}
          <span className={`${prefixCls}-menu-item-title`}>{name}</span>
        </span>
      );
    }

    if (menuItemRender) {
      const renderItemProps = {
        ...item,
        isUrl: isHttpUrl,
        itemPath,
        replace: itemPath === location.pathname,
        onClick: () => onCollapse && onCollapse(true),
      };
      return menuItemRender(renderItemProps, defaultItem, this.props);
    }
    return defaultItem;
  };

  conversionPath = (path: string) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };
}

/**
 * 生成openKeys 的对象
 *
 * @param BaseMenuProps
 */
const getOpenKeysProps = (
  openKeys: React.ReactText[] | false,
  { collapsed }: BaseMenuProps,
): {
  openKeys?: undefined | string[];
} => {
  let openKeysProps = {};
  if (openKeys && !collapsed) {
    openKeysProps = {
      openKeys,
    };
  }
  return openKeysProps;
};

const BaseMenu: React.FC<BaseMenuProps & PrivateSiderMenuProps> = (props) => {
  const {
    mode,
    className,
    handleOpenChange,
    style,
    menuData,
    matchMenuKeys,
    iconfontUrl,
    collapsed,
    onSelect,
    menu,
  } = props;

  const [openKeys, setOpenKeys] = useMountControlledState<string[]>([], {
    onChange: handleOpenChange as any,
  });

  const [selectedKeys, setSelectedKeys] = useMountControlledState<
    string[] | undefined
  >([], {
    onChange: onSelect
      ? (keys) => {
          if (onSelect && keys) {
            onSelect(keys as any);
          }
        }
      : undefined,
  });

  useEffect(() => {
    if (matchMenuKeys) {
      setOpenKeys(matchMenuKeys);
      setSelectedKeys(matchMenuKeys);
    }
  }, [matchMenuKeys.join('-')]);

  useEffect(() => {
    // reset IconFont
    if (iconfontUrl) {
      IconFont = createFromIconfontCN({
        scriptUrl: iconfontUrl,
      });
    }
  }, [iconfontUrl]);

  const openKeysProps = useMemo(
    () => getOpenKeysProps(openKeys, props),
    [openKeys && openKeys.join(','), props.collapsed],
  );

  const lastOpenKeys = useRef<string[]>([]);

  useEffect(() => {
    // if pathname can't match, use the nearest parent's key
    if (matchMenuKeys.join('-') !== (selectedKeys || []).join('-')) {
      setSelectedKeys(matchMenuKeys);
    }
    if (matchMenuKeys.join('-') !== (openKeys || []).join('-')) {
      let newKeys: string[] = matchMenuKeys;
      // 如果不自动关闭，我需要把 openKeys 放进去
      if (menu?.autoClose === false) {
        newKeys = Array.from(
          new Set([
            ...matchMenuKeys,
            ...(openKeys.length ? openKeys : lastOpenKeys.current),
          ]),
        );
      }
      setOpenKeys(newKeys);
    }
    if (collapsed) {
      lastOpenKeys.current = openKeys;
    }
  }, [matchMenuKeys.join('-'), collapsed]);

  const [menuUtils] = useState(() => new MenuUtil(props));

  const cls = classNames(className, {
    'top-nav-menu': mode === 'horizontal',
  });

  // sync props
  menuUtils.props = props;

  const finallyData = props.postMenuData
    ? props.postMenuData(menuData)
    : menuData;

  if (finallyData && finallyData?.length < 1) {
    return null;
  }

  return (
    <Menu
      {...openKeysProps}
      key="Menu"
      mode={mode}
      inlineIndent={16}
      theme="light"
      selectedKeys={selectedKeys}
      style={style}
      className={cls}
      onOpenChange={setOpenKeys}
      {...props.menuProps}
    >
      {menuUtils.getNavMenuItems(finallyData, false)}
    </Menu>
  );
};

export default BaseMenu;
