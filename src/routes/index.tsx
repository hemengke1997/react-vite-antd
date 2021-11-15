import type { ComponentType } from 'react';
import Loading from '@/components/Loading';
import type { MenuDataItem } from '@/layouts/ProLayout/typings';
import loadable from '@loadable/component';

function lazyLoad(src: () => Promise<{ default: ComponentType<any> }>) {
  return loadable(src, { fallback: <Loading /> });
}

const routes: MenuDataItem[] = [
  {
    path: '/',
    component: loadable(() => import('@/layouts/ProLayout/BasicLayout')),
    routes: [
      {
        path: '/test',
        name: '登录的名字可以很长很长很长很长henchfasdfdas',
        routes: [
          {
            path: '/test/1',
            component: lazyLoad(() => import('@/pages/User')),
            name: '1',
            exact: true,
          },
          {
            path: '/test/2',
            component: lazyLoad(() => import('@/pages/User')),
            name: '2',
            exact: true,
            access: 'canReadFoo',
          },
        ],
      },
      {
        path: '/user',
        component: lazyLoad(() => import('@/pages/User')),
        name: '注册',
        exact: true,
      },
      {
        path: '/n',
        name: '测试',
        routes: [
          {
            path: '/n/1',
            component: lazyLoad(() => import('@/pages/User')),
            name: '1',
            exact: true,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    name: '错误页面',
    component: lazyLoad(() => import('@/pages/NotFound')),
  },
];

export default routes;
