/**
 * Package file volume analysis
 */
import visualizer from 'rollup-plugin-visualizer';

/**
 * Whether to generate package preview
 */
export function isReportMode(): boolean {
  return process.env.REPORT === 'true';
}

export function configVisualizerConfig() {
  if (isReportMode()) {
    return visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    });
  }
  return [];
}
