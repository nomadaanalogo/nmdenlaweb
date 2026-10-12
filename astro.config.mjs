// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Dominio final del sitio: se usa para la URL canónica, Open Graph y el sitemap.
  // Debe coincidir con SITE_URL en src/config.ts.
  site: 'https://nmdenlaweb.com',
  vite: {
    plugins: [tailwindcss()]
  }
});
