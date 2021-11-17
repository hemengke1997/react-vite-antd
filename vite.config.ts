import path from 'path';
import type { ConfigEnv, UserConfig } from 'vite';
import { HOST, PORT, VITE_BASE_PATH } from './config/constant';
import { createVitePlugins } from './config/vite/plugins';
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
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        {
          find: 'config',
          replacement: path.resolve(__dirname, './config'),
        },
        {
          find: /^~/,
          replacement: `${path.resolve(__dirname, './node_modules')}/`,
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // modifyVars: themeVariables,
        },
      },
    },
    server: {
      host: HOST,
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
