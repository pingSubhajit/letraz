'use client'

import posthog from 'posthog-js'
import {PostHogProvider} from 'posthog-js/react'
import {ReactNode, useEffect} from 'react'
import {useAuth, useUser} from '@clerk/nextjs'
import * as Sentry from '@sentry/nextjs'

if (typeof window !== 'undefined') {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		person_profiles: 'identified_only',
		opt_out_capturing_by_default: false,
		capture_pageview: true,
		capture_pageleave: true,
		secure_cookie: true,
		persistence: 'localStorage',
		before_send: (event) => {
			if (!event) return null
			try {
				const props = event.properties || {}
				if (props.$current_url) {
					const url = new URL(props.$current_url)
					props.$current_url = `${url.origin}${url.pathname}`
				}
				if (props.$referrer) {
					try {
						const refUrl = new URL(props.$referrer)
						props.referrer_domain = refUrl.hostname
						props.$referrer = `${refUrl.protocol}//${refUrl.hostname}`
					} catch {}
				}
				event.properties = props
			} catch {}
			return event
		}
	})

	// Respect Do Not Track (DNT) and Global Privacy Control (GPC)
	const dnt = (navigator as any)?.doNotTrack === '1' || (window as any)?.doNotTrack === '1'
	const gpc = (navigator as any)?.globalPrivacyControl === true
	if (dnt || gpc) {
		posthog.opt_out_capturing()
	} else {
		posthog.opt_in_capturing()
	}

	// Super properties for environment and build metadata
	try {
		posthog.register({
			env: process.env.VERCEL_ENV || process.env.NODE_ENV,
			app_version: process.env.NEXT_PUBLIC_APP_VERSION,
			is_test_event: (process.env.VERCEL_ENV || process.env.NODE_ENV) !== 'production',
			preview_branch: process.env.VERCEL_GIT_COMMIT_REF
		})
	} catch {}
}

/**
 * Internal component that handles user identification within the PostHog context
 */
const PosthogUserIdentifier = ({children}: {children: ReactNode}) => {
	const {isLoaded: authLoaded, userId} = useAuth()
	const {isLoaded: userLoaded, user} = useUser()

	useEffect(() => {
		// Only proceed if both auth and user data are loaded and PostHog is available
		if (!authLoaded || !userLoaded || !posthog) {
			return
		}

		// If user is authenticated, identify user in PostHog
		if (userId && user) {
			const userProperties = {
				email: user.emailAddresses[0]?.emailAddress,
				username: user.username || user.fullName || 'Unknown User',
				fullName: user.fullName,
				firstName: user.firstName,
				lastName: user.lastName,
				// Add user segment and onboarding metadata
				segment: 'authenticated',
				onboardingComplete: user.publicMetadata?.onboardingComplete || false,
				currentOnboardingStep: user.publicMetadata?.currentOnboardingStep || 'unknown',
				// Add profile metadata
				profileImageUrl: user.imageUrl,
				createdAt: user.createdAt,
				lastSignInAt: user.lastSignInAt,
				// Remove any undefined values to keep PostHog data clean
				...Object.fromEntries(
					Object.entries({
						phoneNumber: user.phoneNumbers[0]?.phoneNumber,
						hasImage: !!user.imageUrl
					}).filter(([_, value]) => value !== undefined)
				)
			}

			// Identify user in PostHog with Clerk user ID as the distinct ID
			posthog.identify(userId, userProperties)

			// Set additional properties for group analysis
			posthog.group('user_segment', 'authenticated')

			// Track user identification event (only once per session)
			if (!posthog.get_property('$user_identified')) {
				posthog.capture('user_identified', {
					source: 'clerk',
					onboarding_complete: userProperties.onboardingComplete,
					current_step: userProperties.currentOnboardingStep
				})
			}

			// Correlate with Sentry using PostHog distinct ID
			try {
				const distinctId = posthog.get_distinct_id()
				Sentry.setTag('ph_distinct_id', distinctId)
			} catch {}
		} else {
			// User is not authenticated, reset to anonymous
			posthog.reset()

			// Set anonymous user group
			posthog.group('user_segment', 'anonymous')

			// Ensure Sentry correlation is cleared/anonymous
			try {
				const distinctId = posthog.get_distinct_id()
				Sentry.setTag('ph_distinct_id', distinctId || 'anonymous')
			} catch {}
		}
	}, [authLoaded, userLoaded, userId, user])

	// Handle cleanup when component unmounts
	useEffect(() => {
		return () => {
			// PostHog will handle cleanup automatically, but we can optionally reset on unmount
			if (!userId && posthog) {
				posthog.reset()
			}
		}
	}, [userId])

	return <>{children}</>
}

const CSPostHogProvider = ({children}: { children: ReactNode }) => {
	return (
		<PostHogProvider client={posthog}>
			<PosthogUserIdentifier>
				{children}
			</PosthogUserIdentifier>
		</PostHogProvider>
	)
}

export default CSPostHogProvider
