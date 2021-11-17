import React from 'react';
import type {
  ProColumnType,
  ProFieldEmptyText,
  ProFieldValueEnumType,
  ProValueType,
  ProSchemaValueEnumMap,
  ProSchemaValueEnumObj,
  ProFieldValueObjectType,
} from '../typing';
import TableStatus, { ProFieldBadgeColor } from '../Status';
import type { ProFieldStatusType } from '../Status';
import { toNumber } from 'lodash';
import { genMoney } from '.';

type RenderToProps<T> = {
  text: React.ReactText;
  index: number;
  valueEnum?: ProFieldValueEnumType;
  valueType: ProValueType;
  rowData?: T;
  columnEmptyText?: ProFieldEmptyText;
  columnProps?: ProColumnType<T> & {
    entry: T;
  };
  // 行的唯一 key
  recordKey?: React.Key;
};

/**
 * 获取类型的 type
 *
 * @param obj
 */
function getType(obj: any) {
  // @ts-ignore
  const type = Object.prototype.toString
    .call(obj)
    .match(/^\[object (.*)\]$/)[1]
    .toLowerCase();
  if (type === 'string' && typeof obj === 'object') return 'object'; // Let "new String('')" return 'object'
  if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
  if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
  return type;
}

export const ObjToMap = (
  value: ProFieldValueEnumType | undefined,
): ProSchemaValueEnumMap => {
  if (getType(value) === 'map') {
    return value as ProSchemaValueEnumMap;
  }
  return new Map(Object.entries(value || {}));
};

/**
 * 把 value 的枚举转化为数组
 *
 * @param valueEnum
 */
export const proFieldParsingValueEnumToArray = (
  valueEnumParams: ProFieldValueEnumType,
): {
  value: string | number;
  text: string;
}[] => {
  const enumArray: {
    value: string | number;
    text: string;
    /** 是否禁用 */
    disabled?: boolean;
  }[] = [];
  const valueEnum = ObjToMap(valueEnumParams);

  valueEnum.forEach((_, key) => {
    const value = (valueEnum.get(key) || valueEnum.get(`${key}`)) as {
      text: string;
      disabled?: boolean;
    };

    if (!value) {
      return;
    }

    if (typeof value === 'object' && value?.text) {
      enumArray.push({
        text: value?.text as unknown as string,
        value: key,
        disabled: value.disabled,
      });
      return;
    }
    enumArray.push({
      text: value as unknown as string,
      value: key,
    });
  });
  return enumArray;
};

/**
 * 转化 text 和 valueEnum 通过 type 来添加 Status
 *
 * @param text
 * @param valueEnum
 * @param pure 纯净模式，不增加 status
 */
export const proFieldParsingText = (
  text: React.ReactText,
  valueEnumParams: ProFieldValueEnumType,
): React.ReactNode => {
  // if (Array.isArray(text)) {
  //   return (
  //     <Space>
  //       {text.map((value) => (
  //         // @ts-ignore
  //         <React.Fragment key={value?.value || value}>
  //           {proFieldParsingText(value, valueEnumParams, columnEmptyText)}
  //         </React.Fragment>
  //       ))}
  //     </Space>
  //   );
  // }

  const valueEnum = ObjToMap(valueEnumParams);

  if (!valueEnum.has(text) && !valueEnum.has(`${text}`)) {
    // @ts-ignore
    return text?.label || text;
  }

  const domText = (valueEnum.get(text) || valueEnum.get(`${text}`)) as {
    text: React.ReactNode;
    status: ProFieldStatusType;
    color?: string;
  };

  if (!domText) {
    // @ts-ignore
    return text?.label || text;
  }

  const { status, color } = domText;

  const Status = TableStatus[status || 'Init'];
  // 如果类型存在优先使用类型
  if (Status) {
    return (
      <Status>
        <span
          title={typeof domText.text === 'string' ? domText.text : undefined}
        >
          {domText.text}
        </span>
      </Status>
    );
  }

  // 如果不存在使用颜色
  if (color) {
    return (
      <ProFieldBadgeColor color={color}>
        <span
          title={typeof domText.text === 'string' ? domText.text : undefined}
        >
          {domText.text}
        </span>
      </ProFieldBadgeColor>
    );
  }
  // 什么都没有使用 text
  return domText.text || domText;
};

/** 获取展示符号 */
export function getSymbolByRealValue(realValue: number) {
  if (realValue === 0) {
    return null;
  }
  if (realValue > 0) {
    return '+';
  }
  return '-';
}

/** 获取到最后展示的数字 */
export function getRealTextWithPrecision(
  realValue: number,
  precision: number = 2,
) {
  return precision && precision > 0 ? realValue.toFixed(precision) : realValue;
}

/**
 * 根据不同的类型来转化数值
 *
 * @param text
 */
function cellRender<T>(config: RenderToProps<T>): React.ReactNode {
  const { text, valueEnum, valueType, columnEmptyText } = config;

  let dom: React.ReactNode;

  if (['', null, undefined].includes(text as string)) {
    return columnEmptyText;
  }
  // 金额
  if (
    (typeof valueType === 'object' && valueType.type === 'money') ||
    valueType === 'money'
  ) {
    const precision = (valueType as ProFieldValueObjectType).precision || 2;

    const valueNode = genMoney({
      precision,
      value: text,
    });

    dom = <>￥{valueNode}</>;
  }

  // 百分比
  if (valueType === 'percent') {
    const realValue =
      typeof text === 'string' && (text as string).includes('%')
        ? toNumber((text as string).replace('%', ''))
        : toNumber(text);

    dom = <>{getRealTextWithPrecision(Math.abs(realValue))}%</>;
  }

  if (!valueType) {
    /** 根据valueEnum生成 dom */
    dom = (
      <>
        {proFieldParsingText(
          text,
          ObjToMap(valueEnum) as unknown as ProSchemaValueEnumObj,
        )}
      </>
    );
  }

  /** 根据valueType生成dom */

  return dom;
}

export default cellRender;
