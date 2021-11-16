import './index.less';
import Icon, { createFromIconfontCN } from '@ant-design/icons';
import { Menu } from 'antd';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import classNames from 'classnames';

import type { MenuProps } from 'antd';
import type { PureSettings } from '../../defaultSettings';
import defaultSettings from '../../defaultSettings';

import type {
  MenuDataItem,
  Route,
  RouterTypes,
  WithFalse,
} from '../../typings';
import isUrl from '../../utils/isUrl';
import isImg from '../../utils/isImg';
import MenuContext from '../../context/MenuContext';
import useMountControlledState from '@/hooks/useMountControlledState';
import getOpenKeysFromMenuData from '../../utils/getOpenKeysFromMenuData';
import type { PrivateSiderMenuProps } from '../SiderMenu/SiderMenu';

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
  openKeys?: WithFalse<string[]> | undefined;
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
    if (Array.isArray(item.children) && item && item.children.length > 0) {
      const name = item.name;
      const { subMenuItemRender, prefixCls, menu, iconPrefixes } = this.props;
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
          cursor: this.props.mode === 'horizontal' ? 'default' : 'pointer',
        }}
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
 * 生成openKeys 的对象，因为设置了openKeys 就会变成受控，所以需要一个空对象
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
    menu,
    matchMenuKeys,
    iconfontUrl,
    collapsed,
    selectedKeys: propsSelectedKeys,
    onSelect,
    openKeys: propsOpenKeys,
  } = props;

  // 用于减少 defaultOpenKeys 计算的组件
  const defaultOpenKeysRef = useRef<string[]>([]);

  const { flatMenuKeys } = MenuContext.usePicker(['flatMenuKeys']);
  const [defaultOpenAll, setDefaultOpenAll] = useMountControlledState(
    menu?.defaultOpenAll,
  );

  const [openKeys, setOpenKeys] = useMountControlledState<
    WithFalse<React.Key[]>
  >(
    () => {
      if (menu?.defaultOpenAll) {
        return getOpenKeysFromMenuData(menuData) || [];
      }
      if (propsOpenKeys === false) {
        return false;
      }
      return [];
    },
    {
      value: propsOpenKeys === false ? undefined : propsOpenKeys,
      onChange: handleOpenChange as any,
    },
  );

  const [selectedKeys, setSelectedKeys] = useMountControlledState<
    string[] | undefined
  >([], {
    value: propsSelectedKeys,
    onChange: onSelect
      ? (keys) => {
          if (onSelect && keys) {
            onSelect(keys as any);
          }
        }
      : undefined,
  });

  useEffect(() => {
    if (
      menu?.defaultOpenAll ||
      propsOpenKeys === false ||
      flatMenuKeys.length
    ) {
      return;
    }
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

  useEffect(() => {
    // if pathname can't match, use the nearest parent's key
    if (matchMenuKeys.join('-') !== (selectedKeys || []).join('-')) {
      setSelectedKeys(matchMenuKeys);
    }
    if (
      !defaultOpenAll &&
      propsOpenKeys !== false &&
      matchMenuKeys.join('-') !== (openKeys || []).join('-')
    ) {
      let newKeys: React.Key[] = matchMenuKeys;
      // 如果不自动关闭，我需要把 openKeys 放进去
      if (menu?.autoClose === false) {
        newKeys = Array.from(new Set([...matchMenuKeys, ...(openKeys || [])]));
      }
      setOpenKeys(newKeys);
    } else if (menu?.ignoreFlatMenu && defaultOpenAll) {
      // 忽略用户手动折叠过的菜单状态，折叠按钮切换之后也可实现默认展开所有菜单
      setOpenKeys(getOpenKeysFromMenuData(menuData));
    } else if (flatMenuKeys.length > 0) setDefaultOpenAll(false);
  }, [matchMenuKeys.join('-'), collapsed]);

  const openKeysProps = useMemo(
    () => getOpenKeysProps(openKeys, props),
    [openKeys && openKeys.join(','), props.collapsed],
  );

  const [menuUtils] = useState(() => new MenuUtil(props));

  const cls = classNames(className, {
    'top-nav-menu': mode === 'horizontal',
  });

  // sync props
  menuUtils.props = props;

  // 这次 openKeys === false 的时候的情况，这种情况下帮用户选中一次
  // 第二此不会使用，所以用了 defaultOpenKeys
  // 这里返回 null，是为了让 defaultOpenKeys 生效
  if (props.openKeys === false && !props.handleOpenChange) {
    defaultOpenKeysRef.current = matchMenuKeys;
  }

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
      defaultOpenKeys={defaultOpenKeysRef.current}
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
