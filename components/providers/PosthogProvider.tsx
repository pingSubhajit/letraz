'use client'

import posthog from 'posthog-js'
import {PostHogProvider} from 'posthog-js/react'
import {ReactNode} from 'react'
import {defaultUrl} from '@/config'

if (typeof window !== 'undefined') {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		person_profiles: 'always'
	})
}

const CSPostHogProvider = ({children}: { children: ReactNode }) => {
	if (defaultUrl.match(/(.(localhost|\d+.\d+.\d+.\d+).|.*vercel.app)/)) {
		return <>{children}</>
	}

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export default CSPostHogProvider
