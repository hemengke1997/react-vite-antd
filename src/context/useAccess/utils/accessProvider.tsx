import useGlobalContext from '@/context/useGlobalContext';
import { MenuDataItem } from '@/layouts/ProLayout/typings';
import React, { useMemo } from 'react';
import accessFactory from '../access';
import AccessContext, { AccessInstance } from './accessContext';
import { traverseModifyRoutes } from './traverseModifyRoutes';

type Routes = MenuDataItem[];

interface Props {
  routes: Routes;
  children?: React.ReactNode;
}

const AccessProvider: React.FC<Props> = (props) => {
  const { children } = props;

  // globalContext
  const { initialState } = useGlobalContext.usePicker(['initialState']);

  const access: AccessInstance = useMemo(
    () => accessFactory(initialState),
    [initialState],
  );

  return React.createElement(
    AccessContext.Provider,
    { value: access },
    // @ts-ignore
    React.cloneElement(children, {
      // @ts-ignore
      ...children.props,
      routes: traverseModifyRoutes(props.routes, access),
    }),
  );
};

export default AccessProvider;
