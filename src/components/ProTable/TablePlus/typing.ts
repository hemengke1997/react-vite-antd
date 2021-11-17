import type { CardProps } from 'antd/lib/card';
import type { TableProps } from 'antd/lib/table';
import type { ColumnType } from 'antd/lib/table/interface';
import type { CSSProperties, ReactNode } from 'react';
import type { LabelTooltipType } from 'antd/lib/form/FormItemLabel';
import { ToolBarProps } from './components/ToolBar';
import { AlertRenderType } from './components/Alert';
import {
  PaginationConfig,
  Sorter,
  Filter,
} from '@ahooksjs/use-request/lib/antdTypes';

export type Bordered = boolean;

export type ProSchemaValueEnumType = {
  /** @name 演示的文案 */
  text: ReactNode;
  /** @name 预定的颜色 */
  status: 'Success' | 'Error' | 'Processing' | 'Warning' | 'Default';
  /** @name 自定义的颜色 */
  color?: string;
  /** @name 是否禁用 */
  disabled?: boolean;
};

export type ProFieldEmptyText = string | false;

export type ProFieldValueEnumType =
  | ProSchemaValueEnumMap
  | ProSchemaValueEnumObj;

/**
 * 支持 Map 和 Record<string,any>
 *
 * @name ValueEnum 的类型
 */
export type ProSchemaValueEnumMap = Map<
  React.ReactText,
  ProSchemaValueEnumType | ReactNode
>;

export type ProSchemaValueEnumObj = Record<
  string,
  ProSchemaValueEnumType | ReactNode
>;

/**
 * @param money 金额
 * @param percent: 百分比
 */
export type ProFieldValueType = 'money' | 'percent';

export type ProFieldValueObjectType = {
  type: ProFieldValueType;
  precision?: number;
};

export type ProValueType = ProFieldValueObjectType | ProFieldValueType;

/** 各个组件公共支持的 render */
export type ProSchema<Entity = Record<string, any>, ExtraProps = unknown> = {
  /** @name 确定这个列的唯一值,一般用于 dataIndex 重复的情况 */
  key?: React.Key;
  /**
   *
   * @name 与实体映射的key
   */
  dataIndex?: string | number;

  /** @name 展示一个 icon，hover 是展示一些提示信息 */
  tooltip?: LabelTooltipType | string;

  /**
   * 支持 object 和Map，Map 是支持其他基础类型作为 key
   *
   * @name 映射值的类型
   */
  valueEnum?: ProFieldValueEnumType;

  /** 选择如何渲染相应的模式 */
  valueType?: ProValueType;

  /**
   *
   * @name 自定义 render 内容
   */
  renderText?: (text: any, record: Entity, index: number) => React.ReactText;
  /**
   * @name 自定义只读模式的dom
   */
  render?: (
    dom: React.ReactNode,
    entity: Entity,
    index: number,
  ) => React.ReactNode;
} & ExtraProps;

export type ExtraProColumnType<T> = Omit<
  ColumnType<T>,
  'render' | 'children' | 'ellipsis'
>;

export declare type ProCellEllipsisType =
  | {
      showTitle?: boolean;
    }
  | boolean
  | {
      /**
       * @description 不要在大表格中使用，计算宽度会导致渲染卡顿
       */
      showTooltip?: boolean;
    };

export type ProColumnType<T = unknown> = ProSchema<
  T,
  ExtraProColumnType<T> & {
    index?: number;

    /**
     * @name 是否有副作用
     */
    effect?: boolean;

    /** 是否缩略 */
    ellipsis?: ProCellEllipsisType;
    /**
     * @name 是否拷贝
     * @deprecated
     */
    copyable?: boolean;

    /** @private */
    listKey?: string;

    children?: ProColumns<T>[];
  }
>;

export type TableRowSelection = TableProps<any>['rowSelection'];

export type ProColumns<T = any> = ProColumnType<T>;

/** ProTable 的类型定义 继承自 antd 的 Table */
export type ProTableProps<T> = {
  columns?: ProColumns<T>[];

  /** @name table 外面卡片的设置 */
  cardProps?: CardProps;

  /** @name 渲染 table */
  tableRender?: (
    props: ProTableProps<T>,
    defaultDom: JSX.Element,
    /** 各个区域的 dom */
    domList: {
      toolbar: JSX.Element | undefined;
      alert: JSX.Element | undefined;
      table: JSX.Element | undefined;
    },
  ) => React.ReactNode;

  /** @name 进度条 */
  progress?: (defaultDom: HTMLDivElement | null) => React.ReactPortal;

  /** @name 渲染操作栏 */
  toolBarRender?: ToolBarProps<T>['toolBarRender'] | false;

  /** @name 给封装的 table 的 className */
  tableClassName?: string;

  /** @name 给封装的 table 的 style */
  tableStyle?: CSSProperties;

  /** @name 左上角的 title */
  headerTitle?: React.ReactNode;

  /** @name 标题旁边的 tooltip */
  tooltip?: string | LabelTooltipType;

  /** @name 溢出隐藏时展示 */
  titleTip?: string;

  /**
   * 设置或者返回false 即可关闭
   *
   * @name 自定义批量操作工具栏左侧信息区域, false 时不显示
   */
  tableAlertRender?: AlertRenderType<T>;
  /**
   * 设置或者返回false 即可关闭
   *
   * @name 自定义批量操作工具栏右侧选项区域, false 时不显示
   */
  tableAlertOptionRender?: AlertRenderType<T>;

  style?: React.CSSProperties;

  /** @name 空值时显示 */
  columnEmptyText?: ProFieldEmptyText;

  /** @name 查询表单和 Table 的卡片 border 配置 */

  cardBordered?: Bordered;

  // TODO： 临时声明，ahooks更新后不需要此声明
  /** @name onChange */
  onChange?: (
    pagination: Omit<PaginationConfig, 'pageSize'> & {
      pageSize?: number | undefined;
    },
    filters?: Filter,
    sorter?: Sorter,
  ) => void;
} & Omit<TableProps<T>, 'columns' | 'onChange'>;
