/*
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

if (process.env.VERCEL_ENV === 'production') {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,

		// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
		tracesSampleRate: 0.2, // Or use a function-based tracesSampler for more granular control.

		// Setting this option to true will print useful information to the console while you're setting up Sentry.
		debug: false,

		// Hook to modify events before they are sent to Sentry (server-side)
		beforeSend: (event, hint) => {
			// Add server-side specific context
			if (event.user) {
				// Add custom fingerprinting for user-specific issues
				event.fingerprint = ['{{ default }}', event.user.id as string || 'anonymous']

				// Add server context
				if (!event.extra) event.extra = {}
				event.extra.serverSide = true
				event.extra.userSegment = event.user.segment || 'unknown'
			}

			return event
		}
	})
}
