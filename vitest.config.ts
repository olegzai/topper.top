/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    exclude: [
      'tests/e2e/**', // Exclude E2E tests from Vitest - these should run with Playwright
      'node_modules',
      'dist',
      'coverage',
      'build',
    ],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8', // используем встроенный провайдер
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        'coverage/**',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts',
        '**/*.d.ts',
        '**/types/**',
        '**/generated/**',
        '**/config/**',
        '**/scripts/**',
        '**/_delete/**',
        '**/.obsidian/**',
        '**/.git/**',
        '**/public/**',
        '**/data/**',
        '**/docker/**',
        '**/docs/**',
        '**/meta/**',
        '**/interfaces/**',
        '**/AGENTS.md',
        '**/KANBAN.md',
        '**/README.md',
      ],
      thresholds: {
        lines: 48, // минимальный порог покрытия строк 48%
        functions: 48, // минимальный порог покрытия функций 48%
        branches: 40, // минимальный порог покрытия ветвлений 40%
        statements: 48, // минимальный порог покрытия операторов 48%
      },
    },
  },
});
