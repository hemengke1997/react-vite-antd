import { RecoilRoot } from 'recoil';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import CreateRoutes from './layouts/ProLayout/renderer-react/renderRoutes';
import routes from './routes';
import { AccessProvider } from './context/useAccess';
import GlobalContext from './context/useGlobalContext';
import ThemeSetting from './components/ThemeSetting';
import initApp from './utils/initApp';

import 'virtual:windi.css';
import './assets/css/index.less';

initApp();

function App() {
  return (
    <ConfigProvider locale={zh_CN}>
      <GlobalContext.Provider>
        <RecoilRoot>
          <BrowserRouter>
            <AccessProvider routes={routes}>
              <CreateRoutes></CreateRoutes>
            </AccessProvider>
          </BrowserRouter>
          <ThemeSetting />
        </RecoilRoot>
      </GlobalContext.Provider>
    </ConfigProvider>
  );
}

export default App;
