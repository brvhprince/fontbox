import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.base.json'] })],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['apps/**/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
