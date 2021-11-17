import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';

import './index.less';

import BaseMenu from '../BaseMenu';
import { SiderMenuProps, PrivateSiderMenuProps } from '../SiderMenu/SiderMenu';
import { HeaderViewProps } from '../HeaderView';
import { Popover, Space, Typography } from 'antd';
import { MenuDataItem } from '../../typings';
import { Link } from 'react-router-dom';

export type TopNavHeaderProps = HeaderViewProps &
  SiderMenuProps &
  PrivateSiderMenuProps;

const defaultRenderLogo = (logo: React.ReactNode): React.ReactNode => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
};

const defaultRenderLogoAndTitle = (
  props: SiderMenuProps,
  renderKey: string = 'menuHeaderRender',
): React.ReactNode => {
  const { logo, title } = props;
  const renderFunction = props[renderKey || ''];
  if (renderFunction === false) {
    return null;
  }
  const logoDom = defaultRenderLogo(logo);
  const titleDom = <h1>{title}</h1>;

  if (renderFunction) {
    // when collapsed, no render title
    return renderFunction(logoDom, props.collapsed ? null : titleDom, props);
  }

  if (renderKey === 'menuHeaderRender') {
    return null;
  }

  return (
    <a>
      {logoDom}
      {props.collapsed ? null : titleDom}
    </a>
  );
};

/**
 * 抽离出来是为了防止 rightSize 经常改变导致菜单 render
 */
const RightContent: React.FC<TopNavHeaderProps> = ({
  rightContentRender,
  ...props
}) => {
  const [rightSize, setRightSize] = useState<number | string>('auto');

  return (
    <div
      style={{
        minWidth: rightSize,
      }}
    >
      <div
        style={{
          paddingRight: 8,
        }}
      >
        <ResizeObserver
          onResize={({ width }: { width: number }) => {
            setRightSize(width);
          }}
        >
          {rightContentRender && (
            <div>
              {rightContentRender({
                ...props,
              })}
            </div>
          )}
        </ResizeObserver>
      </div>
    </div>
  );
};

type OverlayProps = {
  routes: MenuDataItem[];
};

const Overlay: React.FC<OverlayProps> = React.memo((props) => {
  const { routes } = props;

  return (
    <Space size="large" align="start">
      {routes.map((item, index) =>
        item.children ? (
          <Space direction="vertical" key={index}>
            <Space>
              <Typography.Text strong className="tw-text-base">
                {item.name}
              </Typography.Text>
            </Space>
            {item.children
              ?.filter((route) => route.name)
              .map((link, i) => (
                <Link to={link.path!} key={i} target={item.target}>
                  {link.name}
                </Link>
              ))}
          </Space>
        ) : (
          <Link to={item.path!} key={index} target={item.target}>
            {item.name}
          </Link>
        ),
      )}
    </Space>
  );
});

const TopNavHeader: React.FC<TopNavHeaderProps> = (props) => {
  const ref = useRef(null);
  const {
    onMenuHeaderClick,
    contentWidth,
    rightContentRender,
    className: propsClassName,
    style,
  } = props;
  const prefixCls = `${props.prefixCls || 'ant-pro'}-top-nav-header`;
  const headerDom = defaultRenderLogoAndTitle(
    { ...props, collapsed: false },
    'headerTitleRender',
  );

  const className = classNames(prefixCls, propsClassName, 'light');

  return (
    <div className={className} style={style}>
      <div
        ref={ref}
        className={`${prefixCls}-main ${
          contentWidth === 'Fixed' ? 'wide' : ''
        }`}
      >
        {headerDom && (
          <div className={`${prefixCls}-main-left`} onClick={onMenuHeaderClick}>
            <div className={`${prefixCls}-logo`} key="logo" id="logo">
              {headerDom}
            </div>
          </div>
        )}
        <div style={{ flex: 1 }} className={`${prefixCls}-menu`}>
          <BaseMenu
            {...props}
            {...props.menuProps}
            menuItemRender={(renderItemProps, defaultDom) => {
              return renderItemProps.routes ? (
                <Popover
                  overlayClassName={`${prefixCls}-menu-popover`}
                  transitionName="nr-slide-up"
                  mouseEnterDelay={0}
                  align={{
                    ignoreShake: true,
                    offset: [0, 8],
                  }}
                  content={<Overlay routes={renderItemProps.routes} />}
                >
                  <div>{defaultDom}</div>
                </Popover>
              ) : (
                <Link to={renderItemProps.path!}>{defaultDom}</Link>
              );
            }}
          />
        </div>
        {rightContentRender && (
          <RightContent rightContentRender={rightContentRender} {...props} />
        )}
      </div>
    </div>
  );
};

export default React.memo(TopNavHeader);
