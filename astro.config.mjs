import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://serendib.tech',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
  prefetch: false,
});
