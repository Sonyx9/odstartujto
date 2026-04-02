// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// GitHub Pages: statický výstup (SSR s Node na Pages neběží)
export default defineConfig({
  site: 'https://sonyx9.github.io',
  base: '/odstartujto/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
