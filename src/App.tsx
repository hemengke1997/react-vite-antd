import { RecoilRoot } from 'recoil';
import { ConfigProvider, message, notification, Spin } from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import CreateRoutes from './layouts/ProLayout/renderer-react/renderRoutes';
import routes from './routes';
import { AccessProvider } from './context/useAccess';
import GlobalContext from './context/useGlobalContext';

import 'virtual:windi.css';
// import 'antd/dist/antd.variable.min.css';
import '../modified.css';
import './assets/css/index.less';
import SpinLoadingIcon from './components/Loading/SpinLoadingIcon';
import defaultSettings from './layouts/ProLayout/defaultSettings';
import { requestGW } from '@/service';
// import { ContentTypeEnum } from './service/Axios';

message.config({
  maxCount: 3,
  top: defaultSettings.headerHeight,
});

notification.config({
  maxCount: 3,
});

Spin.setDefaultIndicator(<SpinLoadingIcon />);

requestGW
  .get(
    {
      url: 'api/nr-trade-security/xdnphb/adinsight/security/user/getUserInfo',
    },
    {
      isTransformResponse: false,
    },
  )
  .then((res) => {
    console.log(res, '接口返回');
  });

// requestGW.post({
//   url: '/api/adinsight/adinsight/xdnphb/adinsight/tencent/account/advertiser/update',
//   data: {},
//   headers: {
//     'Content-Type': ContentTypeEnum.FORM_URLENCODED,
//   },
// });

ConfigProvider.config({
  theme: {
    primaryColor: 'hsla(234, 100%, 72%, 1)',
    successColor: 'hsla(148, 100%, 35%, 1)',
    processingColor: 'hsla(234, 100%, 72%, 1)',
    errorColor: 'hsla(10, 100%, 55%, 1)',
    warningColor: 'hsla(43, 100%, 50%, 1)',
    infoColor: 'hsla(234, 100%, 72%, 1)',
  },
  prefixCls: 'nr',
});

function App() {
  return (
    <ConfigProvider locale={zh_CN} prefixCls="nr">
      <GlobalContext.Provider>
        <RecoilRoot>
          <BrowserRouter>
            <AccessProvider routes={routes}>
              <CreateRoutes></CreateRoutes>
            </AccessProvider>
          </BrowserRouter>
        </RecoilRoot>
      </GlobalContext.Provider>
    </ConfigProvider>
  );
}

export default App;
