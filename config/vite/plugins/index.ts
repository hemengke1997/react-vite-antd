/**
 * vite plugin
 */

import type { PluginOption } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import windiCSS from 'vite-plugin-windicss';
import { configVisualizerConfig } from './visualizer';
import { VITE_APP_LEGACY } from '../../constant';

export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [react()];

  // vite-plugin-windicss
  vitePlugins.push(windiCSS());

  // vite-plugin-legacy
  VITE_APP_LEGACY && isBuild && vitePlugins.push(legacy);

  // rollup-plugin-visualizer
  vitePlugins.push(configVisualizerConfig());

  return vitePlugins;
}
