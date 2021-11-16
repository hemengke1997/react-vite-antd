import { SWRConfig } from 'swr';
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

message.config({
  maxCount: 3,
  top: defaultSettings.headerHeight,
});

notification.config({
  maxCount: 3,
});

Spin.setDefaultIndicator(<SpinLoadingIcon />);

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

const swrConfig: React.ComponentProps<typeof SWRConfig>['value'] = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 3000,
};

function App() {
  return (
    <ConfigProvider locale={zh_CN} prefixCls="nr">
      <GlobalContext.Provider>
        <RecoilRoot>
          <SWRConfig value={swrConfig}>
            <BrowserRouter>
              <AccessProvider routes={routes}>
                <CreateRoutes></CreateRoutes>
              </AccessProvider>
            </BrowserRouter>
          </SWRConfig>
        </RecoilRoot>
      </GlobalContext.Provider>
    </ConfigProvider>
  );
}

export default App;
