import {
  Redirect,
  Route as ReactRoute,
  Switch,
  SwitchProps,
} from 'react-router-dom';
import type { Route } from '@/layouts/ProLayout/typings';

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

    return ret;
  } else {
    return routes;
  }
}

function getRouteElement({ route, index, opts }: IGetRouteElementOpts) {
  const routeProps = {
    key: route.key || route.path || index,
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

  console.log(routes, 'routes');

  return renderRoutes({ routes: routes! }, switchProps);
}

export default CreateRoutes;
