import { isNil } from 'lodash';
import dayjs from 'dayjs';

function isObject(o: any) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o: { constructor: any }) {
  if (isObject(o) === false) return false;

  // If has modified constructor
  const ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

/**
 * 这里主要是根据omitNil来转化一下数据
 *
 * @param value
 * @param dateFormatter
 * @param proColumnsMap
 */
const conversionSubmitValue = <T = any>(value: T, omitNil?: boolean): T => {
  const tmpValue = {} as T;
  // 如果 value 是 string | null | Blob类型 其中之一，直接返回
  // 形如 {key: [File, File]} 的表单字段当进行第二次递归时会导致其直接越过 typeof value !== 'object' 这一判断
  // https://github.com/ant-design/pro-components/issues/2071
  if (typeof value !== 'object' || isNil(value) || value instanceof Blob) {
    return value;
  }

  Object.keys(value).forEach((key) => {
    const itemValue = value[key];
    if (isNil(itemValue) && omitNil) {
      return;
    }
    // 处理嵌套的情况
    if (
      isPlainObject(itemValue) &&
      // 不是数组
      !Array.isArray(itemValue) &&
      // 不是 moment
      // !moment.isMoment(itemValue) &&
      // 不是Dayjs
      !dayjs.isDayjs(itemValue)
    ) {
      tmpValue[key] = conversionSubmitValue(itemValue, omitNil);
      return;
    }
    // 处理 FormList 的 value
    if (Array.isArray(itemValue)) {
      tmpValue[key] = itemValue.map((arrayValue) => {
        if (dayjs.isDayjs(arrayValue)) {
          return arrayValue;
        }
        return conversionSubmitValue(arrayValue, omitNil);
      });
    }
    tmpValue[key] = itemValue;
  });

  return tmpValue;
};

export default conversionSubmitValue;
