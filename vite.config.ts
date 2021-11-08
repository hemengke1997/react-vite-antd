import path from 'node:path/posix';
import { ConfigEnv, UserConfig } from 'vite';
import { PORT, VITE_BASE_PATH } from './config/constant';
import { createVitePlugins } from './config/vite/plugins';
import { themeVariables } from './config/theme';
import { createProxy } from './config/vite/proxy';
import dayjs from 'dayjs';
import package_ from './package.json';

const { dependencies, devDependencies, name, version } = package_;

const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build';

  console.log(mode, 'mode');

  return {
    base: VITE_BASE_PATH,
    plugins: createVitePlugins(isBuild),
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: themeVariables,
        },
      },
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        {
          find: 'config',
          replacement: path.resolve(__dirname, './config'),
        },
      ],
    },
    server: {
      host: true,
      port: PORT,
      proxy: createProxy(),
    },
    build: {
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: mode === 'build',
        },
      },
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
};
