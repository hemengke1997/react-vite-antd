const getLayoutRenderConfig = (currentPathConfig: {
  layout:
    | {
        hasSiderMenu: boolean;
        hasTopMenu: boolean;
      }
    | false;
}) => {
  const layoutRender: any = {};

  if (currentPathConfig?.layout == false) {
    layoutRender.pure = true;
    return layoutRender;
  }

  if (currentPathConfig?.layout?.hasSiderMenu) {
    layoutRender.hasSiderMenu = false;
  }

  if (currentPathConfig?.layout?.hasTopMenu) {
    layoutRender.hasTopMenu = false;
  }

  return layoutRender;
};

export default getLayoutRenderConfig;
