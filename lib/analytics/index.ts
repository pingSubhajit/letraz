'use client'

import {usePostHog} from 'posthog-js/react'
import type {AnalyticsEventName, AnalyticsEventProps} from '@/lib/analytics/events'

export type TrackOptions = {
	identify?: string
	set?: Record<string, unknown>
	setOnce?: Record<string, unknown>
}

export const bucket = (n: number, edges: number[] = [0, 50, 100, 250, 500, 1000]) => {
	for (let i = 0; i < edges.length - 1; i++) {
		if (n >= edges[i] && n < edges[i + 1]) return `${edges[i]}-${edges[i + 1] - 1}`
	}
	return `${edges[edges.length - 1]}+`
}

export const sizeKbBucket = (bytes: number) => bucket(Math.round(bytes / 1024), [0, 100, 250, 500, 1024, 2048, 4096])
export const resultsBucket = (n: number) => bucket(n, [0, 1, 3, 5, 10, 20, 50])

export const registerAttributionOnce = () => {
	try {
		const params = new URLSearchParams(location.search)
		const payload: Record<string, string> = {}

		const maybe = (key: string, value: string | null) => {
			if (value && value.trim()) payload[key] = value
		}

		maybe('utm_source', params.get('utm_source'))
		maybe('utm_medium', params.get('utm_medium'))
		maybe('utm_campaign', params.get('utm_campaign'))
		maybe('referrer_domain', document.referrer ? new URL(document.referrer).hostname : null)
		maybe('landing_path', location.pathname)

		// @ts-ignore posthog is a global when initialized
		if (Object.keys(payload).length) window.posthog?.register_once(payload)
	} catch {}
}

export const useAnalytics = () => {
	const ph = usePostHog()
	const track = <T extends AnalyticsEventName>(name: T, props?: AnalyticsEventProps<T>, options?: TrackOptions) => {
		if (!ph) return
		try {
			if (options?.identify) {
				// Attach person properties when identifying if provided
				const identifyProps = options.set ? (options.set as Record<string, any>) : undefined
				ph.identify(options.identify, identifyProps)
			}
			const eventProps: Record<string, any> = {
				...(props as any)
			}
			if (options?.set) eventProps.$set = options.set
			if (options?.setOnce) eventProps.$set_once = options.setOnce
			ph.capture(name, eventProps)
		} catch {}
	}
	return {track}
}

export const capture = <T extends AnalyticsEventName>(name: T, props?: AnalyticsEventProps<T>, options?: TrackOptions) => {
	try {
		// @ts-ignore global posthog exists when initialized
		if (options?.identify) {
			// @ts-ignore global posthog exists when initialized
			window.posthog?.identify(options.identify, options.set as any)
		}
		const eventProps: Record<string, any> = {
			...(props as any)
		}
		if (options?.set) eventProps.$set = options.set
		if (options?.setOnce) eventProps.$set_once = options.setOnce
		// @ts-ignore global posthog exists when initialized
		window.posthog?.capture(name, eventProps)
	} catch {}
}

