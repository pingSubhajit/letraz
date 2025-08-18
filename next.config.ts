import {withSentryConfig} from '@sentry/nextjs'
import type {NextConfig} from 'next'
import {validateEnv} from '@/env'

validateEnv()

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'flagsapi.com',
				port: '',
				pathname: '*/**',
				search: ''
			},
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
				port: '',
				pathname: '*/**',
				search: ''
			}
		]
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
		enabled: false,
		ignoredComponents: ['ResumeSearch']
	},

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	tunnelRoute: '/monitoring',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	automaticVercelMonitors: true
})
