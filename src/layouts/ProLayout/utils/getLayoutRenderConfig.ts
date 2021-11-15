const getLayoutRenderConfig = (currentPathConfig: {
  layout:
    | {
        hideMenu: boolean;
        hideNav: boolean;
      }
    | false;
}) => {
  const layoutRender: any = {};

  if (currentPathConfig?.layout == false) {
    layoutRender.pure = true;
    return layoutRender;
  }

  if (currentPathConfig?.layout?.hideMenu) {
    layoutRender.menuRender = false;
  }

  if (currentPathConfig?.layout?.hideNav) {
    layoutRender.headerRender = false;
  }

  return layoutRender;
};

export default getLayoutRenderConfig;
