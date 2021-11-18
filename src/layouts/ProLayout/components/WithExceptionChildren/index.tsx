import React from 'react';
import NotFound from '@/pages/NotFound';
import UnAccessible from '@/pages/UnAccessible/403';

export interface IRouteLayoutConfig {
  /** 默认 false */
  hideMenu?: boolean;
  /** 默认 false */
  hideNav?: boolean;
  /** 默认 false */
  hideFooter?: boolean;
  [key: string]: any;
}

const Exception404 = () => <NotFound />;

const Exception403 = () => <UnAccessible />;

const WithExceptionOpChildren: React.FC<{
  currentPathConfig?: IRouteLayoutConfig;
  children: any;
  notFound: React.ReactNode;
  unAccessible: React.ReactNode;
}> = (props) => {
  const { children, currentPathConfig } = props;

  // 404 现在应该很少会发生
  if (!currentPathConfig) {
    return props.notFound || <Exception404 />;
  }
  /**
   * 这里是没有权限的意思
   */
  if (currentPathConfig.unAccessible || currentPathConfig.unaccessible) {
    return props.unAccessible || <Exception403 />;
  }
  return children;
};

export { Exception404, Exception403, WithExceptionOpChildren };
