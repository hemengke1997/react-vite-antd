import React from 'react';
import { Result, Button } from 'antd';
import { useHistory } from 'react-router-dom';

export interface IRouteLayoutConfig {
  /** 默认 false */
  hideMenu?: boolean;
  /** 默认 false */
  hideNav?: boolean;
  /** 默认 false */
  hideFooter?: boolean;
  [key: string]: any;
}

const Exception404 = ({ backToHome }) => (
  <Result
    status="404"
    title="404"
    subTitle="抱歉，你访问的页面不存在"
    extra={
      <Button type="primary" onClick={backToHome}>
        返回首页
      </Button>
    }
  />
);

const Exception403 = ({ backToHome }) => (
  <Result
    status="403"
    title="403"
    subTitle="抱歉，你无权访问该页面"
    extra={
      <Button type="primary" onClick={backToHome}>
        返回首页
      </Button>
    }
  />
);

const WithExceptionOpChildren: React.FC<{
  currentPathConfig?: IRouteLayoutConfig;
  children: any;
  notFound: React.ReactNode;
  unAccessible: React.ReactNode;
}> = (props) => {
  const { children, currentPathConfig } = props;
  const history = useHistory();

  function backToHome() {
    history.push('/');
  }

  // 404 现在应该很少会发生
  if (!currentPathConfig) {
    return props.notFound || <Exception404 backToHome={backToHome} />;
  }
  /**
   * 这里是没有权限的意思
   */
  if (currentPathConfig.unAccessible || currentPathConfig.unaccessible) {
    return props.unAccessible || <Exception403 backToHome={backToHome} />;
  }
  return children;
};

export { Exception404, Exception403, WithExceptionOpChildren };
