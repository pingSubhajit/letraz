import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
	plugins: [react()],
	test: {
		// Use jsdom environment for component testing
		environment: 'jsdom',

		// Global test setup
		setupFiles: ['./test-setup.ts'],

		// Enable global APIs (describe, it, expect, etc.)
		globals: true,

		// Test file patterns
		include: [
			'**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
			'**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
		],

		// Exclude patterns
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.next/**',
			'**/coverage/**',
			'**/.git/**',
			'**/build/**'
		],

		// Coverage configuration
		coverage: {
			// Use v8 provider for better performance
			provider: 'v8',

			// Coverage reporters
			reporter: ['text', 'json', 'html', 'lcov'],

			// Coverage output directory
			reportsDirectory: './coverage',

			// Coverage thresholds
			thresholds: {
				global: {
					branches: 75,
					functions: 80,
					lines: 80,
					statements: 80
				}
			},

			// Files to include in coverage
			include: [
				'app/**/*.{js,jsx,ts,tsx}',
				'components/**/*.{js,jsx,ts,tsx}',
				'lib/**/*.{js,jsx,ts,tsx}',
				'hooks/**/*.{js,jsx,ts,tsx}'
			],

			// Files to exclude from coverage
			exclude: [
				'**/__tests__/**',
				'**/*.test.{js,jsx,ts,tsx}',
				'**/*.spec.{js,jsx,ts,tsx}',
				'**/node_modules/**',
				'**/.next/**',
				'**/coverage/**',
				'**/*.config.{js,ts}',
				'**/*.d.ts',
				'**/types/**',
				'app/layout.tsx',
				'app/global-error.tsx',
				'app/globals.css',
				'app/robots.ts',
				'app/sitemap.ts',
				'middleware.ts',
				'instrumentation.ts',
				'next.config.ts',
				'tailwind.config.ts',
				'postcss.config.mjs',
				'sentry.*.config.ts',
				'env.ts',
				'config.ts',
				'constants.ts',
				'routes.ts'
			]
		},

		// Test timeout (30 seconds)
		testTimeout: 30000,

		// Hook timeout (10 seconds)
		hookTimeout: 10000,

		// Retry failed tests once
		retry: 1,

		// Run tests in parallel
		pool: 'threads',

		// Maximum number of threads
		poolOptions: {
			threads: {
				maxThreads: 4,
				minThreads: 1
			}
		},



		// Clear mocks between tests
		clearMocks: true,

		// Restore mocks after each test
		restoreMocks: true,

		// Mock reset between tests
		mockReset: true
	},

	// Path resolution to match tsconfig.json
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './')
		}
	},

	// Define global variables for testing
	define: {
		'process.env.NODE_ENV': '"test"'
	}
})
