import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  darkMode: 'class',
  preflight: true,
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        // primary:
      },
    },
  },
});
