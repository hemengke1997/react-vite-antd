import type { Theme } from 'antd/es/config-provider/context.d';

export const themeName = 'ant-theme';

export const theme: Theme = {
  primaryColor: 'rgb(112, 126, 255)',
  successColor: 'rgb(0, 179, 83)',
  errorColor: 'rgb(255, 64, 26)',
  warningColor: 'rgb(255, 183, 0)',
  infoColor: 'rgb(112, 126, 255)',
};

export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;
