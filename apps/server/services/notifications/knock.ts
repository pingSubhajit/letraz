import {secret} from 'encore.dev/config'
import Knock from '@knocklabs/node'
import log from 'encore.dev/log'
import {captureException} from '@/services/utils/sentry'

const knockApiKey = secret('KnockApiKey')

let client: Knock | null = null

const initClient = (): Knock | null => {
	try {
		const apiKey = knockApiKey()
		if (!apiKey) {
			log.warn('Knock API key not configured; notifications disabled')
			return null
		}
		return new Knock({
			apiKey: apiKey
		})
	} catch (err) {
		log.warn('Failed initializing Knock client; notifications disabled', {err: String(err)})

		// Report to Sentry - initialization failures should be tracked
		captureException(err, {
			tags: {
				operation: 'knock-initialization',
				service: 'notifications'
			},
			level: 'warning' // Warning since app continues without notifications
		})

		return null
	}
}

export const getKnock = (): Knock | null => {
	if (!client) client = initClient()
	return client
}
