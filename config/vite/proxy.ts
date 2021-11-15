import { ProxyOptions } from 'vite';

type ProxyTargetList = Record<string, ProxyOptions>;

// const httpsRE = /^https:\/\//;

// const isHttps = (target: string) => {
//   return httpsRE.test(target);
// };

export function createProxy() {
  const ProxyList: ProxyTargetList = {
    '/api': {
      target: 'http://localhost:3333',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: true,
    },
  };

  return ProxyList;
}
