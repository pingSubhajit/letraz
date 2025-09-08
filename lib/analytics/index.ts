'use client'

import {usePostHog} from 'posthog-js/react'
import type {AnalyticsEventName, AnalyticsEventProps} from '@/lib/analytics/events'

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
		const utm_source = params.get('utm_source') || undefined
		const utm_medium = params.get('utm_medium') || undefined
		const utm_campaign = params.get('utm_campaign') || undefined
		const referrer_domain = document.referrer ? new URL(document.referrer).hostname : undefined
		const landing_path = location.pathname
		// @ts-ignore posthog is a global when initialized
		window.posthog?.register_once({utm_source, utm_medium, utm_campaign, referrer_domain, landing_path})
	} catch {}
}

export const useAnalytics = () => {
	const ph = usePostHog()
	const track = <T extends AnalyticsEventName>(name: T, props?: AnalyticsEventProps<T>) => {
		if (!ph) return
		try {
			ph.capture(name, props as any)
		} catch {}
	}
	return {track}
}

export const capture = <T extends AnalyticsEventName>(name: T, props?: AnalyticsEventProps<T>) => {
	try {
		// @ts-ignore global posthog exists when initialized
		window.posthog?.capture(name, props as any)
	} catch {}
}


