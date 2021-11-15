import { SWRConfig } from 'swr';
import { RecoilRoot } from 'recoil';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import CreateRoutes from './layouts/ProLayout/renderer-react/renderRoutes';
import routes from './routes';

import 'virtual:windi.css';
// import 'antd/dist/antd.variable.min.css';
import '../modified.css';
// import './assets/css/index.less';

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
      <RecoilRoot>
        <SWRConfig>
          <BrowserRouter>
            <CreateRoutes routes={routes}></CreateRoutes>
          </BrowserRouter>
        </SWRConfig>
      </RecoilRoot>
    </ConfigProvider>
  );
}

export default App;
