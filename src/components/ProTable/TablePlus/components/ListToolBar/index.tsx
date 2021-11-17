import React, { useContext } from 'react';
import type { TabPaneProps } from 'antd';
import { Space, ConfigProvider } from 'antd';
import classNames from 'classnames';
import type { LabelTooltipType } from 'antd/lib/form/FormItemLabel';
import LabelIconTip from '../../utils/LabelIconTip';

import './index.less';

export type ListToolBarSetting = {
  icon: React.ReactNode;
  tooltip?: LabelTooltipType | string;
  key?: string;
  onClick?: (key?: string) => void;
};

/** Antd 默认直接导出了 rc 组件中的 Tab.Pane 组件。 */
type TabPane = TabPaneProps & {
  key?: string;
};

export type ListToolBarTabs = {
  activeKey?: string;
  onChange?: (activeKey: string) => void;
  items?: TabPane[];
};

export type ListToolBarProps = {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 标题 */
  title?: React.ReactNode;
  /** 副标题 */
  subTitle?: React.ReactNode;
  /** 标题提示 */
  tooltip?: string | LabelTooltipType;
  /** 工具栏右侧操作区 */
  actions?: React.ReactNode[];
};

const ListToolBar: React.FC<ListToolBarProps> = ({
  prefixCls: customizePrefixCls,
  title,
  subTitle,
  tooltip,
  className,
  actions = [],
  style,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('pro-table-list-toolbar', customizePrefixCls);

  /** 没有 key 的时候帮忙加一下 key 不加的话很烦人 */
  const renderActionsDom = () => {
    if (!Array.isArray(actions)) {
      return actions;
    }
    if (actions.length < 1) {
      return null;
    }
    return (
      <Space align="center">
        {actions.map((action, index) => {
          if (!React.isValidElement(action)) {
            return <React.Fragment key={index}>{action}</React.Fragment>;
          }
          return React.cloneElement(action, {
            key: index,
            ...action?.props,
          });
        })}
      </Space>
    );
  };

  const actionDom = renderActionsDom();

  return (
    <div style={style} className={classNames(`${prefixCls}`, className)}>
      <div className={`${prefixCls}-container`}>
        <Space className={`${prefixCls}-left`}>
          {tooltip || title || subTitle ? (
            <div className={`${prefixCls}-title`}>
              <LabelIconTip
                tooltip={tooltip}
                label={title}
                subTitle={subTitle}
              />
            </div>
          ) : (
            <div></div>
          )}
        </Space>
        <Space className={`${prefixCls}-right`} size={16}>
          {actionDom}
        </Space>
      </div>
    </div>
  );
};

export default ListToolBar;
