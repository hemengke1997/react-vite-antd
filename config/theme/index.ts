import fs from 'fs';
import path from 'path';
import lessToJs from 'less-vars-to-js';

export const themeVariables = lessToJs(
  fs.readFileSync(
    path.resolve(__dirname, '../../src/assets/css/theme.less'),
    'utf8',
  ),
);
