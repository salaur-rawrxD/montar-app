import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // App shell — cache JS, CSS, HTML, and local assets on install.
      // navigateFallback means the app loads from cache even offline.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Google Fonts CSS — fresh on each request, stale fallback.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            // Google Fonts woff2 files — immutable, cache for a year.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase and NHTSA are NOT cached — always network-first for data.
        ],
      },

      // Manifest — preserves all values from the previous manifest.webmanifest.
      // The plugin now owns this file; public/manifest.webmanifest was removed.
      manifest: {
        name: 'MONTAR',
        short_name: 'MONTAR',
        description: 'Load Faster. Move more cars.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0B1726',
        theme_color: '#0B1726',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],

  // Expose both VITE_ and NEXT_PUBLIC_ prefixes so the same .env.local
  // works in this Vite app and in any future Next.js layer.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],

  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});
