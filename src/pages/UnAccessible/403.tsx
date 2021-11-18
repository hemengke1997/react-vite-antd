import React from 'react';
import { Button, Result, Space } from 'antd';
import useGlobalContext from '@/context/useGlobalContext';
import { useHistory } from 'react-router';
import PageLoading from '@/components/Loading';

const UnAccessible: React.FC = () => {
  const { initialState } = useGlobalContext.usePicker(['initialState']);

  const { userInfo } = initialState || {};

  const history = useHistory();

  const goIndex = () => {
    history.push('/user/info');
  };

  if (!userInfo) {
    return <PageLoading />;
  }

  return (
    <Result
      status="warning"
      title="权限不足"
      subTitle="请联系管理员"
      extra={
        <Space>
          <Button type="primary" onClick={goIndex}>
            前往个人主页
          </Button>

          <Button onClick={() => window.location.reload()}>刷新页面</Button>
        </Space>
      }
    />
  );
};

export default UnAccessible;
