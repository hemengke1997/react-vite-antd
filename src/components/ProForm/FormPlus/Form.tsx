import React, { useRef, useEffect, useState } from 'react';
import type { FormProps, FormItemProps, FormInstance } from 'antd';
import { Form } from 'antd';
import useUrlState from '@ahooksjs/use-url-state';
import conversionSubmitValue from './utils/conversionSubmitValue';
// import { useNotificationError } from '@/hooks';
// import type { FieldError } from 'rc-field-form/es/interface';
import classNames from 'classnames';
import styles from './index.module.less';
import { runFunction } from '@/components/ProTable/TablePlus/utils/runFunction';

export type CommonFormProps<
  T extends Record<string, any> = Record<string, any>,
> = {
  /** @name 获取真正的可以获得值的 from */
  formRef?: React.MutableRefObject<
    | (FormInstance & {
        getFieldsFormatValue?: () => T;
      })
    | undefined
  >;

  /** @name 表单出错时notification的message */
  errorMessage?: string;

  /**
   * 支持异步操作，更加方便
   *
   * @name 表单结束后调用
   */
  onFinish?: (formData: T) => Promise<boolean | void>;

  /** @name 同步结果到 url 中 */
  syncToUrl?: boolean | ((values: T, type: 'get' | 'set') => T);

  /** @name 额外的 url 参数 中 */
  extraUrlParams?: Record<string, any>;
  /**
   * 同步结果到 initialValues,默认为true如果为false，reset的时将会忽略从url上获取的数据
   *
   * @name 是否将 url 参数写入 initialValues
   */
  syncToInitialValues?: boolean;

  /**
   * 如果为 false,会原样保存。
   *
   * @default true
   * @param 要不要值中的 Null 和 undefined
   */
  omitNil?: boolean;

  /** 表单初始化成功，比如布局，label等计算完成 */
  onInit?: (values: T) => void;
};

export type BaseFormProps<T = Record<string, any>> = {
  onInit?: (values: T) => void;
  formItemProps?: FormItemProps;
  labelBordered?: boolean;
} & Omit<FormProps, 'onFinish'> &
  CommonFormProps<T>;

const genParams = (
  syncUrl: BaseFormProps<any>['syncToUrl'],
  params: Record<string, any>,
  type: 'get' | 'set',
) => {
  if (syncUrl === true) {
    return params;
  }
  return runFunction(syncUrl, params, type);
};

function BaseForm<T = Record<string, any>>(props: BaseFormProps<T>) {
  const {
    children,
    formItemProps,
    form: userForm,
    onInit,
    extraUrlParams = {},
    syncToUrl,
    syncToInitialValues = true,
    labelAlign = 'left',
    errorMessage,
    omitNil = true,
    colon = false,
    labelBordered,
    className,
    ...rest
  } = props;

  const [form] = Form.useForm();

  /** 同步 url 上的参数 */
  const [urlSearch, setUrlSearch] = useUrlState({});
  const formRef = useRef<FormInstance>(userForm || form);

  const items = React.Children.toArray(children);

  const transformKey = (values: any, omit: boolean) => {
    return conversionSubmitValue(values, omit);
  };

  const content = items;

  useEffect(() => {
    const finalValues = transformKey(
      formRef.current.getFieldsValue(true),
      omitNil,
    );
    onInit?.(finalValues);
  }, []);

  // 如果为 false，不需要触发设置进去
  const [urlParamsMergeInitialValues, setUrlParamsMergeInitialValues] =
    useState(() => {
      if (!syncToUrl) {
        return {};
      }
      return genParams(syncToUrl, urlSearch, 'get');
    });

  useEffect(() => {
    if (syncToInitialValues) return;
    window.requestAnimationFrame(() => {
      setUrlParamsMergeInitialValues({});
    });
  }, [syncToInitialValues]);

  useEffect(() => {
    if (!syncToUrl) return;
    setUrlSearch({
      ...urlSearch,
      ...extraUrlParams,
    });
  }, [extraUrlParams, syncToUrl]);

  // const [alterError] = useNotificationError();

  return (
    <Form
      form={userForm || form}
      colon={colon}
      labelAlign={labelAlign}
      className={classNames(className, {
        [styles.labelBorderd]: labelBordered,
      })}
      {...rest}
      // 组合 urlSearch 和 initialValues
      initialValues={{
        ...urlParamsMergeInitialValues,
        ...rest.initialValues,
      }}
      onValuesChange={(changedValues, values) => {
        rest?.onValuesChange?.(
          transformKey(changedValues, omitNil),
          transformKey(values, omitNil),
        );
      }}
      onFinish={async () => {
        if (!rest.onFinish) {
          return;
        }

        const finalValues = transformKey(
          formRef.current.getFieldsValue(),
          omitNil,
        );

        await rest.onFinish(finalValues);

        if (syncToUrl) {
          // 把没有的值设置为未定义可以删掉 url 的参数
          const params = Object.keys(
            transformKey(formRef.current.getFieldsValue(), false),
          ).reduce((pre, next) => {
            return {
              ...pre,
              [next]: finalValues[next] || undefined,
            };
          }, extraUrlParams);
          /** 在同步到 url 上时对参数进行转化 */
          setUrlSearch(genParams(syncToUrl, params, 'set'));
        }
      }}
      onFinishFailed={async (args) => {
        // alterError(args.errorFields as FieldError[], errorMessage);
        rest.onFinishFailed?.(args);
      }}
    >
      {content}
    </Form>
  );
}

function FormPlus<T = Record<string, any>>(props: BaseFormProps<T>) {
  const { initialValues, ...rest } = props;

  return (
    <BaseForm<T>
      {...rest}
      initialValues={{
        ...initialValues,
      }}
    />
  );
}

export type { FormProps, FormItemProps, FormInstance };

FormPlus.useForm = Form.useForm;
FormPlus.Item = Form.Item;

export default FormPlus;
