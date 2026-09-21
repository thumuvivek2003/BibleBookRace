import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Path aliases keep imports stable and make the dependency direction explicit
// (ui -> features -> domain -> data), instead of long relative chains.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  test: {
    // Domain tests run in node; screen smoke tests opt into jsdom with a
    // `@vitest-environment jsdom` comment.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
