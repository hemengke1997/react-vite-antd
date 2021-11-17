import { useCallback, useMemo, useRef } from 'react';
import useATRH, { ResizableUniqIdPrefix } from '@/hooks/useResizableHeader';
import TablePlus, { ProColumns, ProTableProps } from './TablePlus';
import { useNProgress } from '@tanem/react-nprogress';
import ReactDOM from 'react-dom';
import styles from './index.module.less';
import defaultSettings from '@/layouts/ProLayout/defaultSettings';
import { Table } from 'antd';

type ProTableComponentType = {
  /** @name 表头是否可拖拽 */
  resizable?: boolean;

  /** @name 表格change后是否滚动到表格顶部 */
  scrollToTopOnChange?: boolean;
};

/**
 * 单元格是否更新
 * @param dataIndex
 * @param now
 * @param prev
 * @returns
 */
export const shouldCellUpdate = (
  column: ProColumns | undefined,
  now: any,
  prev: any,
) => {
  // 由useATRH生成的dataindex，始终update
  if (
    typeof column?.dataIndex === 'string' &&
    column.dataIndex.startsWith(ResizableUniqIdPrefix)
  ) {
    return true;
  }
  if (column?.dataIndex) {
    return (
      now?.[column?.dataIndex] !== prev?.[column?.dataIndex] || column?.effect
    );
  }
  return true;
};

function loop(c: ProColumns[]) {
  c.forEach((item, index) => {
    c[index] = {
      ...item,
      title: typeof item.title === 'string' ? item.title : '',
      shouldCellUpdate: (x, y) => {
        return (
          !!item.shouldCellUpdate?.(x, y) || !!shouldCellUpdate(item, x, y)
        );
      },
    };
    if (item.children) {
      loop(item.children);
    }
  });
  return c;
}

/**
 * 基于TablePlus二次封装
 * @description 默认添加 `shouldCellUpdate`
 */
function ProTable<DataType extends Record<string, any>>(
  props: ProTableProps<DataType> & ProTableComponentType,
) {
  const {
    columns: columnsProp,
    scroll,
    onChange: onChangeProp,
    resizable = true,
    loading,
    scrollToTopOnChange,
    ...rest
  } = props;

  const { resizableColumns, header, tableWidth } = useATRH({
    columns: columnsProp,
    minConstraints: 50,
  });

  const components = useMemo(
    () => ({
      header,
    }),
    [header],
  );

  const columns = useMemo(
    () => loop([...(resizable ? resizableColumns : columnsProp || [])]),
    [resizable, resizableColumns, columnsProp],
  );

  const { progress, isFinished, animationDuration } = useNProgress({
    isAnimating: loading as boolean,
    minimum: 0.0008,
  });

  const progressDom = useCallback(
    (baseTableDom: HTMLDivElement | null) => {
      const height = 3;
      const tableHeader = baseTableDom?.querySelector('.ant-table-header');
      const top = (tableHeader?.clientHeight || height) - height;

      return ReactDOM.createPortal(
        <div
          style={{
            position: 'absolute',
            zIndex: 9527,
            width: '100%',
            pointerEvents: 'none',
            opacity: !!progress && isFinished ? 0 : 1,
            transition: `opacity ${animationDuration}ms linear`,
            top,
          }}
          key={Number(loading)}
        >
          <div
            style={{
              transition: `width ${animationDuration}ms linear`,
              width: `${progress * 100}%`,
              borderRadius: 100,
              backgroundColor: 'var(--primary-5)',
              height,
            }}
          />
        </div>,
        tableHeader || document.body,
      );
    },
    [isFinished, progress],
  );

  const tableRef = useRef<HTMLDivElement>(null);

  const onChange: ProTableProps<DataType>['onChange'] = (...args) => {
    onChangeProp?.(...args);

    const dom = tableRef.current;

    if ((dom?.getBoundingClientRect().top || 0) < 0) {
      scrollToTopOnChange &&
        window.scrollTo({ top: Math.abs(dom!.offsetTop + 12 || 0) });
    }
  };

  return (
    <div ref={tableRef}>
      <TablePlus
        columns={columns}
        scroll={{
          x: resizable ? tableWidth : undefined,
          scrollToFirstRowOnChange: true,
          ...scroll,
        }}
        components={resizable ? components : undefined}
        onChange={onChange}
        progress={progressDom}
        sticky={{
          offsetHeader: defaultSettings.headerHeight,
          offsetScroll: 4,
        }}
        loading={{
          spinning: Boolean(loading),
          indicator: <></>,
          wrapperClassName: styles.loadingWrapper,
        }}
        showSorterTooltip={false}
        {...rest}
      />
    </div>
  );
}

ProTable.Summary = Table.Summary;

export default ProTable;
