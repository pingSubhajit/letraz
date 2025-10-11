/*
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	dsn: 'https://f34e959d40c5b570d470ffa889ca0217@o1422927.ingest.us.sentry.io/4508663726473216',

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	// Enable logs to be sent to Sentry
	enableLogs: true,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false
})
