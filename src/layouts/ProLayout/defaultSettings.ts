import { WithFalse } from './typings';

export type ContentWidth = 'Fluid' | 'Fixed';

export type RenderSetting = {
  headerRender?: false;
  menuRender?: false;
  menuHeaderRender?: false;
};
export type PureSettings = {
  /** @name customize header height */
  headerHeight?: number;
  /** @name layout of content: `Fluid` or `Fixed`, only works when layout is top */
  contentWidth?: ContentWidth;
  /** @name sticky header */
  fixedHeader?: boolean;
  /** @name sticky siderbar */
  fixSiderbar?: boolean;
  /** @name menu 相关的一些配置 */
  menu?: {
    defaultOpenAll?: boolean;
    ignoreFlatMenu?: boolean; // 是否忽略用户手动折叠过的菜单状态，如选择忽略，折叠按钮切换之后也可实现展开所有菜单
    type?: 'sub' | 'group';
    autoClose?: false;
  };
  /**
   * 设置为 false，在 layout 中只展示 pageName，而不是 pageName - title
   *
   * @name Layout 的 title，也会显示在浏览器标签上
   */
  title?: WithFalse<string>;
  /**
   * Your custom iconfont Symbol script Url eg：//at.alicdn.com/t/font_1039637_btcrd5co4w.js
   * 注意：如果需要图标多色，Iconfont 图标项目里要进行批量去色处理 Usage: https://github.com/ant-design/ant-design-pro/pull/3517
   */
  iconfontUrl?: string;
};

export type ProSettings = PureSettings & RenderSetting;

const defaultSettings: ProSettings = {
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  headerHeight: 64,
  title: '网站title',
  iconfontUrl: '',
  menu: {
    autoClose: false,
    ignoreFlatMenu: true,
  },
};
export default defaultSettings;
