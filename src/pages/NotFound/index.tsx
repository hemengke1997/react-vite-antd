import React, { useEffect } from 'react';
import { message } from 'antd';
import { useHistory } from 'react-router';

const NoFoundPage: React.FC = () => {
  const history = useHistory();
  useEffect(() => {
    message.warning('页面不存在');
    history.push('/');
  }, []);
  return null;
};

export default NoFoundPage;
