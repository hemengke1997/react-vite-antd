import SpinLoadingIcon from '@/components/Loading/SpinLoadingIcon';
import { message, notification, Spin } from 'antd';
import { ConfigProvider } from 'antd';
import {
  defaultSettings,
  theme as defaultTheme,
  themeName,
} from '@/utils/setting';

/**
 * App启动时需要做的的配置
 */
function initTheme() {
  const theme = localStorage.getItem(themeName);

  if (theme) {
    ConfigProvider.config({
      theme: JSON.parse(theme),
    });
  } else {
    localStorage.setItem(themeName, JSON.stringify(defaultTheme));
    ConfigProvider.config({
      theme: defaultTheme,
    });
  }
}

function initApp() {
  message.config({
    maxCount: 3,
    top: defaultSettings.headerHeight,
  });

  notification.config({
    maxCount: 3,
  });

  Spin.setDefaultIndicator(<SpinLoadingIcon />);
  initTheme();
}

export default initApp;
