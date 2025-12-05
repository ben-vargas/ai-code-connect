import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable globals (describe, it, expect) without imports
    globals: true,

    // Test file patterns
    include: ['src/**/*.test.ts'],

    // Exclude node_modules and dist
    exclude: ['node_modules', 'dist'],

    // Environment - node for CLI testing
    environment: 'node',

    // Timeout for tests (10 seconds)
    testTimeout: 10000,
  },
});
