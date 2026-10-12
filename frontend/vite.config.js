import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/** Configure Vite and the browser-like component test environment. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    clearMocks: true,
    restoreMocks: true,
  },
});
