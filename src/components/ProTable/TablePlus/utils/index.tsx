import { TablePaginationConfig } from 'antd';
import { PaginationConfig } from 'antd/es/pagination';
import { padEnd } from 'lodash';

export declare type BorderedType = 'search' | 'table';

export type Bordered = boolean;

export const showTotal = (total: number) => (
  <div className="tw-text-fourth tw-flex tw-h-full tw-items-center">
    共 {total} 条
  </div>
);

/**
 * 合并用户 props 和 预设的 props
 *
 * @param pagination
 * @param action
 * @param intl
 */
export function mergePagination(
  pagination:
    | TablePaginationConfig
    | PaginationConfig
    | boolean
    | undefined = {},
): TablePaginationConfig | false | undefined {
  if (pagination === false) {
    return false;
  }
  const defaultPagination: TablePaginationConfig | PaginationConfig =
    typeof pagination === 'object' ? pagination : {};

  return {
    showTotal,
    showSizeChanger: true,
    ...(defaultPagination as TablePaginationConfig),
  };
}

/**
 * 根据 key 和 dataIndex 生成唯一 id
 *
 * @param key 用户设置的 key
 * @param dataIndex 在对象中的数据
 * @param index 序列号，理论上唯一
 */
export const genColumnKey = (
  key?: React.ReactText | undefined,
  index?: number,
): string => {
  if (key) {
    return Array.isArray(key) ? key.join('-') : key.toString();
  }
  return `${index}`;
};

export const isMergeCell = (
  dom: any, // 如果是合并单元格的，直接返回对象
) => dom && typeof dom === 'object' && dom?.props?.colSpan;

export const isBordered = (borderType: BorderedType, border?: Bordered) => {
  if (border === undefined) {
    return false;
  }
  if (typeof border === 'boolean') {
    return border;
  }
  return border[borderType];
};

export function genMoney(props: {
  value: string | number;
  precision?: number;
  groupSeparator?: string;
  decimalSeparator?: string;
}) {
  const {
    value,
    precision: precisionProp,
    groupSeparator = ',',
    decimalSeparator = '.',
  } = props;

  const precision = precisionProp || 2;
  let valueNode: React.ReactNode;

  // Internal formatter
  const val: string = String(value);

  const cells = val.match(/^(-?)(\d*)(\.(\d+))?$/);

  // Process if illegal number
  if (!cells || val === '-') {
    valueNode = val;
  } else {
    const negative = cells[1];
    let int = cells[2] || '0';
    let decimal = cells[4] || '';

    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

    if (typeof precision === 'number') {
      decimal = padEnd(decimal, precision, '0').slice(0, precision);
    }

    if (decimal) {
      decimal = `${decimalSeparator}${decimal}`;
    }

    valueNode = [
      <span key="int">
        {negative}
        {int}
      </span>,
      decimal && <span key="decimal">{decimal}</span>,
    ];
  }

  return valueNode;
}
