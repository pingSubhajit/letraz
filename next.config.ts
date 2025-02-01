import {withSentryConfig} from '@sentry/nextjs'
import type {NextConfig} from 'next'
import {validateEnv} from '@/env'

validateEnv()

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true
	}
}

export default withSentryConfig(nextConfig, {
	org: 'letraz-app',
	project: 'letraz-client',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// An auth token is required for uploading source maps.
	authToken: process.env.SENTRY_AUTH_TOKEN,

	// Delete source maps after upload
	sourcemaps: {
		deleteSourcemapsAfterUpload: true
	},

	widenClientFileUpload: true,

	// Automatically annotate React components to show their full name in breadcrumbs and session replay
	reactComponentAnnotation: {
		enabled: true
	},

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	tunnelRoute: '/monitoring',

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	automaticVercelMonitors: true
})
