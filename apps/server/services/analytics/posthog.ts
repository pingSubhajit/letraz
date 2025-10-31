import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'
import {PostHog} from 'posthog-node'
import {captureException} from '@/services/utils/sentry'

const posthogApiKey = secret('PosthogApiKey')
const posthogHost = secret('PosthogHost') || 'https://us.i.posthog.com'

let client: PostHog | null = null

const initClient = (): PostHog | null => {
	try {
		const apiKey = posthogApiKey()
		if (!apiKey) {
			log.warn('PostHog API key not configured; analytics disabled')
			return null
		}
		const host = posthogHost()
		return new PostHog(apiKey, {host})
	} catch (err) {
		log.warn('Failed initializing PostHog client; analytics disabled', {err: String(err)})

		// Report to Sentry - initialization failures should be tracked
		captureException(err, {
			tags: {
				operation: 'posthog-initialization',
				service: 'analytics'
			},
			level: 'warning' // Warning since app continues without analytics
		})

		return null
	}
}

export const getPosthog = (): PostHog | null => {
	if (!client) client = initClient()
	return client
}


