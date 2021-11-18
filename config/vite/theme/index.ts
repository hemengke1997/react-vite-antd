import fs from 'fs';
import lessToJS from 'less-vars-to-js';
import path from 'path';

export const themeVariables = lessToJS(
  fs.readFileSync(
    path.resolve(__dirname, '../../../src/assets/css/theme.less'),
    'utf8',
  ),
  {
    stripPrefix: true,
  },
);
