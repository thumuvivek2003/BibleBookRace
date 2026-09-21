import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import path from 'node:path';

/**
 * GitHub Pages serves a project site from a sub-path
 * (https://<user>.github.io/BibleBookRace/), so the production build needs a
 * matching `base`. Override it with VITE_BASE when deploying somewhere else —
 * a custom domain or a user site both want `VITE_BASE=/`.
 */
const REPO_BASE = '/BibleBookRace/';

/**
 * GitHub Pages has no server-side routing: a hard refresh on /training would
 * 404 before React ever loads. Pages serves 404.html for any unknown path, so
 * shipping a copy of index.html under that name turns it into an SPA fallback.
 */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const out = path.resolve(process.cwd(), 'dist');
      copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));
    },
  };
}

export default defineConfig(({ command }) => ({
  // Dev stays at the root; only the build carries the Pages sub-path.
  base: command === 'build' ? (process.env.VITE_BASE ?? REPO_BASE) : '/',
  plugins: [react(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      // Path aliases keep imports stable and make the dependency direction
      // explicit (ui -> features -> domain -> data).
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  test: {
    // Domain tests run in node; screen smoke tests opt into jsdom with a
    // `@vitest-environment jsdom` comment.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
}));
