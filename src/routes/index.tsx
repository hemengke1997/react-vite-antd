import type { ComponentType } from 'react';
import Loading from '@/components/Loading';
import type { Route } from '@/layouts/ProLayout/typings';
import loadable from '@loadable/component';

function lazyLoad(src: () => Promise<{ default: ComponentType<any> }>) {
  return loadable(src, { fallback: <Loading /> });
}

const routes: Route[] = [
  {
    path: '/',
    redirect: '/promotion',
    exact: true,
  },
  {
    path: '/',
    component: lazyLoad(() => import('@/layouts/ProLayout/BasicLayout')),
    routes: [
      {
        path: '/auth/:platform',
        name: '账号授权',
        component: lazyLoad(() => import('@/pages/User')),
        hideInMenu: true,
        layout: {
          hasTopMenu: false,
        },
        exact: true,
      },
      {
        path: '/promotion',
        name: '推广',
        access: 'isRoles',
        routes: [
          {
            path: '/promotion',
            redirect: '/promotion/gdt',
            exact: true,
          },
          {
            path: '/promotion/toutiao',
            name: '头条',
            routes: [
              {
                path: '/promotion/toutiao',
                redirect: '/promotion/toutiao/launch',
                exact: true,
              },
              {
                path: '/promotion/toutiao/launch',
                name: '投放管理',
                component: lazyLoad(() => import('@/pages/Home')),
                exact: true,
                access: 'isRoles',
              },
            ],
          },
          {
            path: '/promotion/gdt',
            name: '广点通',
            access: 'isRoles',
            routes: [
              {
                path: '/promotion/gdt',
                redirect: '/promotion/gdt/launch',
                exact: true,
              },
              {
                path: '/promotion/gdt/launch',
                name: '投放管理',
                access: 'isRoles',
                component: lazyLoad(() => import('@/pages/Home')),
                exact: true,
              },
            ],
          },
        ],
      },
      {
        path: '/report',
        name: '报表',
        access: 'isRoles',
        routes: [
          {
            path: '/report',
            redirect: '/report/toutiao',
            exact: true,
          },
          {
            path: '/report/toutiao',
            name: '头条',
            access: 'isRoles',
            routes: [
              {
                path: '/report/toutiao',
                redirect: '/report/toutiao/push',
                exact: true,
              },
              {
                path: '/report/toutiao/push',
                name: '报表定时推送',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/report/toutiao/push',
                    redirect: '/report/toutiao/push/list',
                    exact: true,
                  },
                  {
                    path: '/report/toutiao/push/list',
                    name: '定时推送列表',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                  {
                    path: '/report/toutiao/push/detail/:id?',
                    name: '定时推送详情',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                ],
              },
              {
                path: '/report/toutiao/material',
                name: '素材报表',
                access: 'isRoles',
                component: lazyLoad(() => import('@/pages/Home')),
                exact: true,
              },
            ],
          },
          {
            path: '/report/gdt',
            name: '广点通',
            access: 'isRoles',
            routes: [
              {
                path: '/report/gdt',
                redirect: '/report/gdt/push',
                exact: true,
              },
              {
                path: '/report/gdt/push',
                name: '报表定时推送',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/report/gdt/push',
                    redirect: '/report/gdt/push/list',
                    exact: true,
                  },
                  {
                    path: '/report/gdt/push/list',
                    name: '定时推送列表',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                  {
                    path: '/report/gdt/push/detail/:id?',
                    name: '定时推送详情',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                ],
              },
              {
                path: '/report/gdt/material',
                name: '素材报表',
                access: 'isRoles',
                component: lazyLoad(() => import('@/pages/Home')),
                exact: true,
              },
            ],
          },
          {
            path: '/report/common',
            name: '通用报表',
            access: 'isRoles',
            routes: [
              {
                path: '/report/common',
                redirect: '/report/common/material',
                exact: true,
              },
              {
                path: '/report/common/material',
                name: '素材报表',
                access: 'isRoles',
                component: lazyLoad(() => import('@/pages/User')),
                exact: true,
              },
            ],
          },
          {
            path: '/report/weixin',
            name: '微信MP',
            access: 'isRoles',
            routes: [
              {
                path: '/report/weixin',
                redirect: '/report/weixin/push',
                exact: true,
              },
              {
                path: '/report/weixin/push',
                name: '报表定时推送',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/report/weixin/push',
                    redirect: '/report/weixin/push/list',
                    exact: true,
                  },
                  {
                    path: '/report/weixin/push/list',
                    name: '定时推送列表',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                  {
                    path: '/report/weixin/push/detail/:id?',
                    name: '定时推送详情',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: '资产',
        path: '/property',
        access: 'isRoles',
        routes: [
          {
            path: '/property',
            redirect: '/property/common',
            exact: true,
          },
          {
            path: '/property/common',
            name: '通用',
            access: 'isRoles',
            routes: [
              {
                path: '/property/common',
                redirect: '/property/common/material',
                exact: true,
              },
              {
                path: '/property/common/material',
                name: '素材库',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/property/common/material',
                    redirect: '/property/common/material/lib',
                    exact: true,
                  },
                  {
                    path: '/property/common/material/lib',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '素材库',
                    exact: true,
                  },
                  {
                    path: '/property/common/material/upload',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '上传素材',
                    exact: true,
                  },
                ],
              },
              {
                path: '/property/common/creativeGroup',
                name: '创意团队',
                access: 'isRoles',
                component: lazyLoad(() => import('@/pages/Home')),
                exact: true,
              },
            ],
          },
        ],
      },
      {
        path: '/account',
        name: '账户',
        routes: [
          {
            path: '/account',
            redirect: '/account/media',
            exact: true,
          },
          {
            path: '/account/media',
            name: '媒体投放账户',
            access: 'isRoles',
            routes: [
              {
                path: '/account/media',
                redirect: '/account/media/toutiao',
                exact: true,
              },
              {
                path: '/account/media/toutiao',
                name: '头条',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/account/media/toutiao',
                    redirect: '/account/media/toutiao/list',
                    exact: true,
                  },
                  {
                    path: '/account/media/toutiao/list',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '头条 - 媒体投放账户',
                    exact: true,
                  },
                  {
                    path: '/account/media/toutiao/add',
                    name: '添加头条广告投放账号',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                ],
              },
              {
                path: '/account/media/gdt',
                name: '广点通',
                hideChildrenInMenu: true,
                access: 'isRoles',
                routes: [
                  {
                    path: '/account/media/gdt',
                    redirect: '/account/media/gdt/list',
                    exact: true,
                  },
                  {
                    path: '/account/media/gdt/list',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '广点通 - 媒体投放账户',
                    exact: true,
                  },
                  {
                    path: '/account/media/gdt/add',
                    name: '添加广点通广告投放账号',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                ],
              },
              {
                path: '/account/media/weixin',
                name: '微信MP',
                access: 'isRoles',
                component: lazyLoad(() => import('@/pages/Home')),
              },
            ],
          },
          {
            path: '/account/manage',
            name: '用户管理',
            access: 'isRoles',
            routes: [
              {
                path: '/account/manage',
                redirect: '/account/manage/role',
                exact: true,
              },
              {
                path: '/account/manage/department',
                component: lazyLoad(() => import('@/pages/Home')),
                name: '部门管理',
                access: 'isRoles',
                exact: true,
              },
              {
                path: '/account/manage/staff',
                component: lazyLoad(() => import('@/pages/Home')),
                name: '人员管理',
                access: 'isRoles',
                exact: true,
              },
              {
                path: '/account/manage/project',
                component: lazyLoad(() => import('@/pages/Home')),
                name: '项目管理',
                access: 'isRoles',
                exact: true,
              },
              {
                path: '/account/manage/auth',
                name: '权限管理',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/account/manage/auth',
                    redirect: '/account/manage/auth/list',
                    exact: true,
                  },
                  {
                    path: '/account/manage/auth/list',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '权限列表',
                    exact: true,
                  },
                  {
                    path: '/account/manage/auth/edit/:id',
                    name: '编辑权限',
                    component: lazyLoad(() => import('@/pages/Home')),
                    exact: true,
                  },
                ],
              },
            ],
          },
          {
            path: '/account/ticket',
            name: '工单管理',
            access: 'isRoles',
            routes: [
              {
                path: '/account/ticket',
                redirect: '/account/ticket/all',
                exact: true,
              },
              {
                path: '/account/ticket/all',
                name: '全部工单',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/account/ticket/all',
                    redirect: '/account/ticket/all/list',
                    exact: true,
                  },
                  {
                    path: '/account/ticket/all/list',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '工单列表',
                    exact: true,
                  },
                  {
                    path: '/account/ticket/all/detail/:id',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '工单详情',
                    exact: true,
                  },
                ],
              },
              {
                path: '/account/ticket/manage',
                name: '服务商管理',
                access: 'isRoles',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/account/ticket/manage',
                    redirect: '/account/ticket/manage/list',
                    exact: true,
                  },
                  {
                    path: '/account/ticket/manage/list',
                    component: lazyLoad(() => import('@/pages/Home')),
                    name: '服务商管理',
                    exact: true,
                  },
                ],
              },
            ],
          },
          {
            path: '/account/user',
            name: '个人中心',
            routes: [
              {
                path: '/account/user',
                redirect: '/account/user/info',
                exact: true,
              },
              {
                path: '/account/user/info',
                component: lazyLoad(() => import('@/pages/Home')),
                name: '个人信息',
                exact: true,
              },
            ],
          },
        ],
      },
      {
        path: '/batch',
        name: '批量投放',
        hideInMenu: true,
        hideChildrenInMenu: true,
        access: 'isRoles',
        routes: [
          {
            path: '/batch',
            redirect: '/batch/gdt',
            exact: true,
          },
          {
            path: '/batch/gdt',
            name: '广点通',
            access: 'isRole',
            routes: [
              {
                path: '/batch/gdt',
                redirect: '/batch/gdt/create',
                exact: true,
              },
              {
                path: '/batch/gdt/create',
                component: lazyLoad(() => import('@/pages/Home')),
                name: '批量投放',
                exact: true,
              },
            ],
          },
          {
            path: '/batch/toutiao',
            name: '头条',
            access: 'isRole',
            routes: [
              {
                path: '/batch/toutiao',
                redirect: '/batch/toutiao/create',
                exact: true,
              },
              {
                path: '/batch/toutiao/create',
                component: lazyLoad(() => import('@/pages/Home')),
                name: '批量投放',
                exact: true,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        name: '错误页面',
        exact: true,
        component: lazyLoad(() => import('@/pages/Home')),
      },
    ],
  },
];

export default routes;
