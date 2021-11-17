import type { TableColumnType } from 'antd';
import type { ProColumns, ProFieldEmptyText } from '../typing';
import { columnRender } from './columnRender';

const omitUndefinedAndEmptyArr = <T,>(obj: T): T => {
  const newObj = {} as T;
  Object.keys(obj || {}).forEach((key) => {
    if (Array.isArray(obj[key]) && obj[key]?.length === 0) {
      return;
    }
    if (obj[key] === undefined) {
      return;
    }
    newObj[key] = obj[key];
  });
  return newObj;
};

/**
 * 转化 columns 到 pro 的格式 主要是 render 方法的自行实现
 *
 * @param columns
 * @param map
 * @param columnEmptyText
 */
export function genProColumnToColumn<T>(props: {
  columns: ProColumns<T>[] | undefined;
  columnEmptyText: ProFieldEmptyText;
}): (TableColumnType<T> & { index?: number })[] {
  const { columns, columnEmptyText } = props;
  return columns?.map((columnProps, columnsIndex) => {
    const { valueEnum } = columnProps;

    const tempColumns = {
      index: columnsIndex,
      ...columnProps,
      valueEnum,
      ellipsis: {
        showTitle: false,
      },
      fixed: columnProps.fixed,
      width: columnProps.width,
      children: columnProps.children
        ? genProColumnToColumn({
            ...props,
            columns: columnProps?.children,
          })
        : undefined,
      render: (text: any, rowData: T, index: number) => {
        const renderProps = {
          columnProps,
          text,
          rowData,
          index,
          columnEmptyText,
        };
        return columnRender<T>(renderProps);
      },
    };

    return omitUndefinedAndEmptyArr(tempColumns);
  }) as unknown as (TableColumnType<T> & {
    index?: number;
  })[];
}
