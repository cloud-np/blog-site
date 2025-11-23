import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.ts'],
    exclude: ['tests/e2e/**/*'],
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@libs': path.resolve(__dirname, './src/libs'),
      '@data': path.resolve(__dirname, './src/data'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
    },
  },
});
