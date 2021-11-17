import React from 'react';
import { Tooltip, Typography } from 'antd';
import cellRender from './cellRender';
import type { ProColumns, ProFieldEmptyText, ProValueType } from '../typing';
import { isMergeCell } from '.';
import { isNil } from 'lodash';

/** 转化列的定义 */
type ColumnRenderInterface<T> = {
  columnProps: ProColumns<T>;
  text: any;
  rowData: T;
  index: number;
  columnEmptyText?: ProFieldEmptyText;
};

/**
 * 生成 Copyable 或 Ellipsis 的 dom
 *
 * @param dom
 * @param item
 * @param text
 */
export const genCopyable = (
  dom: React.ReactNode | string,
  item: ProColumns<any>,
  text: string,
) => {
  const showTooltip = (item.ellipsis as { showTooltip: boolean })?.showTooltip;

  let _text = text;

  if (item.valueEnum && Object.keys(item.valueEnum).length) {
    _text = item.valueEnum[text]?.text;
  }

  if (showTooltip) {
    return (
      <Tooltip title={_text}>
        <div
          className="tw-truncate"
          style={{ width: 'fit-content', maxWidth: '100%' }}
        >
          {_text}
        </div>
      </Tooltip>
    );
  }

  if (item.copyable) {
    // 由于Typography.Text的 `copyable` `ellipsis` 计算dom导致表格卡顿。不要在大表格中使用
    return (
      <Typography.Text
        style={{
          width: '100%',
          margin: 0,
          padding: 0,
        }}
        copyable={
          item.copyable && _text
            ? {
                text: _text,
                tooltips: ['', ''],
              }
            : undefined
        }
        ellipsis={showTooltip && _text ? { tooltip: _text } : false}
      >
        {dom}
      </Typography.Text>
    );
  }

  if (item.ellipsis === true) {
    return <span title={_text}>{dom}</span>;
  }
  return dom;
};

/**
 * 这个组件负责单元格的具体渲染
 *
 * @param param0
 */
export function columnRender<T>({
  columnProps,
  text,
  rowData,
  index,
  columnEmptyText,
}: ColumnRenderInterface<T>): any {
  const { renderText = (val: any) => val, valueEnum } = columnProps;

  const renderTextStr = renderText(text, rowData, index);

  const textDom = cellRender<T>({
    text: renderTextStr,
    valueType: columnProps.valueType as ProValueType,
    index,
    rowData,
    valueEnum,
    columnProps: {
      ...columnProps,
      entry: rowData,
    },
    columnEmptyText,
  });

  const dom: React.ReactNode = genCopyable(textDom, columnProps, renderTextStr);

  if (columnProps.render) {
    const renderDom = columnProps.render(dom, rowData, index);

    // 如果是合并单元格的，直接返回对象
    if (isMergeCell(renderDom)) {
      return renderDom;
    }

    return renderDom as React.ReactNode;
  }

  const isReactRenderNode =
    React.isValidElement(dom) || ['string', 'number'].includes(typeof dom);

  return !isNil(dom) && isReactRenderNode ? dom : null;
}
