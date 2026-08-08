import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * ADR-0050: a client-rendered SPA. The build output is a static dist/ directory —
 * no Node server, no SSR, no server components. Every route is behind a login,
 * there is no crawler to serve, and SSR's costs (a process to supervise and cap, a
 * server/client boundary in every component, and a second place authorization could
 * be evaluated) buy nothing here.
 *
 * Tailwind is a BUILD dependency via this plugin. The frozen prototype loads it
 * from a CDN <script> and React from esm.sh through an import map; both resolve
 * dependencies at request time, which is the class of failure ADR-0032 exists to
 * eliminate. tools/assert-no-cdn.mjs blocks either from reaching a built artefact.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Hashed filenames are what make the immutable cache headers in ADR-0032 safe.
    // index.html is served no-cache; getting that pair backwards ships a
    // permanently stale SPA that cannot be fixed remotely.
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    // ADR-0033: single domain, no CORS. In development the API is proxied under
    // the same origin so the production topology is reproduced rather than
    // approximated — a dev-only CORS shim would hide same-origin bugs until deploy.
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
    },
  },
});
