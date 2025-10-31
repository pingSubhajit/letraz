'use client'

import {useEffect} from 'react'
import {capture, registerAttributionOnce} from '@/lib/analytics'

const AcquisitionTracker = () => {
	useEffect(() => {
		registerAttributionOnce()
		try {
			const params = new URLSearchParams(location.search)
			const utm_source = params.get('utm_source') || undefined
			const utm_medium = params.get('utm_medium') || undefined
			const utm_campaign = params.get('utm_campaign') || undefined
			const referrer_domain = document.referrer ? new URL(document.referrer).hostname : undefined
			capture('marketing_landing_view', {utm_source, utm_medium, utm_campaign, referrer_domain})
		} catch {}
	}, [])

	return null
}

export default AcquisitionTracker


