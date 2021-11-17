import React from 'react';
import type { TableColumnType } from 'antd';
import type { SearchProps } from 'antd/lib/input';
import isDeepEqualReact from 'fast-deep-equal/es6/react';
import type { LabelTooltipType } from 'antd/lib/form/FormItemLabel';
import ListToolBar from '../ListToolBar';

export type OptionConfig = {
  density?: boolean;
  fullScreen?: OptionsType;
  reload?: OptionsType;
  setting?:
    | boolean
    | {
        draggable?: boolean;
        checkable?: boolean;
      };
  search?: (SearchProps & { name?: string }) | boolean;
};

export type OptionsType =
  | ((e: React.MouseEvent<HTMLSpanElement>) => void)
  | boolean;

export type ToolBarProps<T = unknown> = {
  headerTitle?: React.ReactNode;
  tooltip?: string | LabelTooltipType;
  toolBarRender?: (rows: {
    selectedRowKeys?: (string | number)[];
    selectedRows?: T[];
  }) => React.ReactNode[];
  selectedRowKeys?: (string | number)[];
  selectedRows?: T[];
  className?: string;
  columns: TableColumnType<T>[];
};

function ToolBar<T>({
  headerTitle,
  tooltip,
  toolBarRender,
  selectedRowKeys,
  selectedRows,
}: ToolBarProps<T>) {
  // 操作列表
  const actions = toolBarRender
    ? toolBarRender({ selectedRowKeys, selectedRows })
    : [];

  return (
    <ListToolBar title={headerTitle} tooltip={tooltip} actions={actions} />
  );
}

export type ToolbarRenderProps<T> = {
  tableColumn: any[];
  tooltip?: string | LabelTooltipType;
  selectedRows: T[];
  hideToolbar: boolean;
  selectedRowKeys: React.Key[];
  headerTitle: React.ReactNode;
  toolBarRender?: ToolBarProps<T>['toolBarRender'];
};
/** 这里负责与table交互，并且减少 render次数 */
class ToolbarRender<T> extends React.Component<ToolbarRenderProps<T>> {
  isEquals = (next: ToolbarRenderProps<T>) => {
    const {
      tableColumn,
      tooltip,
      selectedRows,
      selectedRowKeys,
      headerTitle,
      toolBarRender,
      hideToolbar,
    } = this.props;

    return isDeepEqualReact(
      {
        hideToolbar,
        tableColumn,
        tooltip,
        selectedRows,
        selectedRowKeys,
        headerTitle,
        toolBarRender,
      },
      {
        hideToolbar: next.hideToolbar,
        tableColumn: next.tableColumn,
        tooltip: next.tooltip,
        selectedRows: next.selectedRows,
        selectedRowKeys: next.selectedRowKeys,
        headerTitle: next.headerTitle,
        toolBarRender: next.toolBarRender,
      },
    );
  };
  shouldComponentUpdate = (next: ToolbarRenderProps<T>) => {
    return !this.isEquals(next);
  };

  render = () => {
    const {
      hideToolbar,
      tableColumn,
      tooltip,
      selectedRows,
      selectedRowKeys,
      headerTitle,
      toolBarRender,
    } = this.props;

    // 不展示 toolbar
    if (hideToolbar) {
      return null;
    }
    return (
      <ToolBar<T>
        tooltip={tooltip}
        columns={tableColumn}
        headerTitle={headerTitle}
        selectedRows={selectedRows}
        selectedRowKeys={selectedRowKeys}
        toolBarRender={toolBarRender}
      />
    );
  };
}

export default ToolbarRender;
