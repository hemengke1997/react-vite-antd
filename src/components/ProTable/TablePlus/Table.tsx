import { Card, ConfigProvider, Table } from 'antd';
import { ProTableProps, TableRowSelection } from './typing';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { isBordered, mergePagination } from './utils';
import Alert from './components/Alert';
import ToolBar from './components/ToolBar';
import { genProColumnToColumn } from './utils/genProColumnToColumn';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import useMountControlledState from '@/hooks/useMountControlledState';
import { useMemoizedFn } from 'ahooks';

function TableRender<T extends Record<string, any>>(
  props: ProTableProps<T> & {
    tableColumn: any[];
    toolbarDom: JSX.Element | null;
    alertDom: JSX.Element | null;
    rootRef: React.RefObject<HTMLDivElement>;
  },
) {
  const {
    rowKey,
    tableClassName,
    tableColumn,
    progress,
    pagination,
    rowSelection,
    size,
    tableStyle,
    toolbarDom,
    style,
    cardProps,
    alertDom,
    className,
    cardBordered,
    rootRef,
    ...rest
  } = props;

  const columns = tableColumn;

  const getTableProps = useMemoizedFn(() => ({
    ...rest,
    size,
    rowSelection: rowSelection === false ? undefined : rowSelection,
    className: tableClassName,
    style: tableStyle,
    columns,
  }));

  const baseTableDomRef = useRef<HTMLDivElement>(null);

  /** 如果有 ellipsis ，设置 tableLayout 为 fixed */
  const tableLayout =
    // 优先以用户设置为准
    props.tableLayout ?? props.columns?.some((item) => item.ellipsis)
      ? 'fixed'
      : 'auto';

  const baseTableDom = (
    <div style={{ position: 'relative', width: '100%' }} ref={baseTableDomRef}>
      {progress?.(baseTableDomRef.current)}

      <Table<T>
        {...getTableProps()}
        rowKey={rowKey}
        tableLayout={tableLayout}
        pagination={
          pagination
            ? { ...pagination, size: 'default', showLessItems: true }
            : false
        }
      />
    </div>
  );

  /** Table 区域的 dom，为了方便 render */
  const tableAreaDom = (
    <Card
      bordered={isBordered('table', cardBordered)}
      style={{
        height: '100%',
      }}
      bodyStyle={
        toolbarDom
          ? {
              paddingTop: 0,
              paddingBottom: 0,
            }
          : {
              padding: 0,
            }
      }
      {...cardProps}
    >
      {toolbarDom}
      {alertDom}
      {baseTableDom}
    </Card>
  );

  const renderTable = () => {
    if (props.tableRender) {
      return props.tableRender(props, tableAreaDom, {
        toolbar: toolbarDom || undefined,
        alert: alertDom || undefined,
        table: baseTableDom || undefined,
      });
    }
    return tableAreaDom;
  };

  const proTableDom = (
    <div className={classNames(className)} style={style} ref={rootRef}>
      {renderTable()}
    </div>
  );

  return proTableDom;
}

const ProTable = <T extends Record<string, any>>(
  props: ProTableProps<T> & {
    defaultClassName: string;
  },
) => {
  const {
    cardBordered,
    className: propsClassName,
    headerTitle,
    pagination: propsPagination,
    columns: propsColumns = [],
    toolBarRender,
    style,
    cardProps,
    tableStyle,
    tableClassName,
    rowSelection: propsRowSelection = false,
    tableAlertRender = false,
    defaultClassName,
    columnEmptyText = '-',
    rowKey,
    tooltip,
    ...rest
  } = props;

  const className = classNames(defaultClassName, propsClassName);

  /** 获取 table 的 dom ref */
  const rootRef = useRef<HTMLDivElement>(null);

  /** 单选多选的相关逻辑 */
  const [selectedRowKeys, setSelectedRowKeys] = useMountControlledState<
    React.ReactText[]
  >([], {
    value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
  });

  const selectedRowsRef = useRef<T[]>([]);

  const setSelectedRowsAndKey = useCallback(
    (keys: React.ReactText[], rows: T[]) => {
      setSelectedRowKeys(keys);
      if (!propsRowSelection || !propsRowSelection?.selectedRowKeys) {
        selectedRowsRef.current = rows;
      }
    },
    [setSelectedRowKeys],
  );

  // ---------- 列计算相关 start  -----------------
  const tableColumn = useMemo(() => {
    return genProColumnToColumn<T>({
      columns: propsColumns,
      columnEmptyText,
    });
  }, [propsColumns, columnEmptyText]);

  /** 清空所有的选中项 */
  const onCleanSelected = useCallback(() => {
    if (propsRowSelection && propsRowSelection.onChange) {
      propsRowSelection.onChange([], []);
    }
    setSelectedRowsAndKey([], []);
  }, [propsRowSelection, setSelectedRowsAndKey]);

  /** 行选择相关的问题 */
  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    ...propsRowSelection,
    onChange: (keys, rows) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows);
      }
      setSelectedRowsAndKey(keys, rows);
    },
  };

  /** 页面编辑的计算 */
  const pagination = useMemo(() => {
    return mergePagination(propsPagination);
  }, [propsPagination]);

  /** 内置的工具栏 */
  const toolbarDom =
    toolBarRender === false ? null : (
      <ToolBar<T>
        headerTitle={headerTitle}
        hideToolbar={!headerTitle && !toolBarRender}
        selectedRows={selectedRowsRef.current}
        selectedRowKeys={selectedRowKeys}
        tableColumn={tableColumn}
        tooltip={tooltip}
        toolBarRender={toolBarRender}
      />
    );

  /** 内置的多选操作栏 */
  const alertDom =
    propsRowSelection !== false ? (
      <Alert<T>
        selectedRowKeys={selectedRowKeys}
        selectedRows={selectedRowsRef.current}
        onCleanSelected={onCleanSelected}
        alertOptionRender={rest.tableAlertOptionRender}
        alertInfoRender={tableAlertRender}
      />
    ) : null;

  return (
    <TableRender
      {...props}
      rootRef={rootRef}
      rowSelection={propsRowSelection !== false ? rowSelection : undefined}
      className={className}
      tableColumn={tableColumn}
      alertDom={alertDom}
      toolbarDom={toolbarDom}
      pagination={pagination}
    />
  );
};

/**
 * 🏆 仿ProTable，移除了大部分不需要的功能
 *
 * @param props
 */
const ProviderWarp = <T extends Record<string, any>>(
  props: ProTableProps<T>,
) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  return (
    <ErrorBoundary>
      <ProTable<T> defaultClassName={getPrefixCls('pro-table')} {...props} />
    </ErrorBoundary>
  );
};

ProviderWarp.Summary = Table.Summary;

export default ProviderWarp;
