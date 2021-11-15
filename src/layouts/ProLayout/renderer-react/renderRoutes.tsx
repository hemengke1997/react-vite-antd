import React from 'react';
import {
  Redirect,
  Route as ReactRoute,
  Switch,
  SwitchProps,
} from 'react-router-dom';
import type { Route } from '@/layouts/ProLayout/typings';
import isUrl from '../utils/isUrl';

interface IOpts {
  routes: Route[];
  extraProps?: object;
  parentPath?: string;
}

interface IGetRouteElementOpts {
  route: Route;
  index: number;
  opts: IOpts;
}

/**
 * 合并路径
 * @param path 当前路径
 * @param parentPath 父级路径
 */
export const mergePath = (path: string = '', parentPath: string = '/') => {
  if (path === '*') {
    return path;
  }
  if (isUrl(path)) {
    return path;
  }
  if ((path || parentPath).startsWith('/')) {
    return path;
  }
  return `/${parentPath}/${path}`.replace(/\/\//g, '/').replace(/\/\//g, '/');
};

/**
 * 渲染路由
 * @see https://github1s.com/umijs/umi/blob/HEAD/packages/renderer-react/src/renderRoutes/renderRoutes.tsx
 */

function render({
  route,
  opts,
  props,
}: {
  route: Route;
  opts: IOpts;
  props: any;
}) {
  const routes = renderRoutes(
    {
      ...opts,
      routes: route.routes || [],
    },
    { location: props.location },
  );

  let { component: Component } = route;

  if (Component) {
    const newProps = {
      ...props,
      ...opts.extraProps,
      route,
    };

    let ret = <Component {...newProps}>{routes}</Component>;

    // route.wrappers
    // if (wrappers) {
    //   let len = wrappers.length - 1;
    //   while (len >= 0) {
    //     ret = createElement(wrappers[len], newProps, ret);
    //     len -= 1;
    //   }
    // }

    return ret;
  } else {
    return routes;
  }
}

function getRouteElement({ route, index, opts }: IGetRouteElementOpts) {
  const routeProps = {
    key: route.key || `${route.path}-${index}`,
    sensitive: route.sensitive,
    exact: route.exact,
    strict: route.strict,
    path: route.path,
  };
  if (route.redirect) {
    return <Redirect {...routeProps} from={route.path} to={route.redirect} />;
  }
  return (
    <ReactRoute
      {...routeProps}
      render={(props) =>
        render({
          route,
          opts,
          props,
        })
      }
    />
  );
}

export function renderRoutes(opts: IOpts, switchProps = {}) {
  return opts.routes ? (
    <Switch {...switchProps}>
      {opts.routes.map((route, index) =>
        getRouteElement({
          route,
          index,
          opts: {
            ...opts,
            parentPath: opts.parentPath || '/',
          },
        }),
      )}
    </Switch>
  ) : null;
}

function CreateRoutes(props: { routes?: Route[]; switchProps?: SwitchProps }) {
  const { routes, switchProps } = props;
  return renderRoutes({ routes: routes! }, switchProps);
}

export default React.memo(CreateRoutes);
