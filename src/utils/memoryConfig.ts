import { isDevMode, isProdMode } from './env';

interface configData {
  ads: string;
  ade: string;
  main: string;
  admin: string;
  admina: string;
  data: string;
  loginUrl: string;
  OSSKey: string;
}
let config = {} as configData;

if (isDevMode()) {
  config = {
    ads: 'http://test.e.newrank.cn',
    ade: 'http://test.a.newrank.cn',
    main: 'http://test.main.newrank.cn',
    admin: 'http://test.admin.newrank.cn',
    admina: 'http://test.admina.newrank.cn',
    data: 'http://test.data.newrank.cn',
    loginUrl: `http://test.main.newrank.cn/user/login?displayType=login&backUrl=${encodeURIComponent(
      window.location.href,
    )}&source=130&type=118&scene=adinsight_login`,
    OSSKey: 'v881282c9b7d94535b6411b7g',
  };
} else if (isProdMode()) {
  config = {
    ads: 'https://e.newrank.cn',
    ade: 'https://a.newrank.cn',
    main: 'https://newrank.cn',
    admin: 'http://admin.newrank.cn',
    admina: 'http://admina.newrank.cn',
    data: 'https://data.newrank.cn',
    loginUrl: `https://newrank.cn/user/login?displayType=login&backUrl=${encodeURIComponent(
      window.location.href.replace(/^http:\/\//g, 'https://'),
    )}&source=130&scene=adinsight_login`,
    OSSKey: 'v0b18c2e979684830bd8ffdme',
  };
}

const export_config = config;

export default export_config;
