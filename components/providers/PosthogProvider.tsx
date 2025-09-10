'use client'

import posthog from 'posthog-js'
import {PostHogProvider} from 'posthog-js/react'
import {ReactNode, useEffect} from 'react'
import {useAuth, useUser} from '@clerk/nextjs'
import * as Sentry from '@sentry/nextjs'

if (typeof window !== 'undefined') {
	if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_POSTHOG_HOST) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn('PostHog disabled: missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST environment variables')
		}
	} else {
		// Respect Do Not Track (DNT) and Global Privacy Control (GPC) BEFORE init
		const dnt = (navigator as any)?.doNotTrack === '1' || (navigator as any)?.doNotTrack === 'yes' || (window as any)?.doNotTrack === '1'
		const gpc = (navigator as any)?.globalPrivacyControl === true
		const trackingBlocked = dnt || gpc

		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			person_profiles: 'identified_only',
			opt_out_capturing_by_default: trackingBlocked,
			capture_pageview: !trackingBlocked,
			capture_pageleave: !trackingBlocked,
			persistence: 'localStorage', // Removed secure_cookie since it's irrelevant for localStorage
			before_send: (event) => {
				if (!event) return null
				try {
					const props = event.properties || {}

					// Don't overwrite reserved PostHog properties; add sanitized copies instead
					if (props.$current_url) {
						try {
							const url = new URL(String(props.$current_url))
							props.sanitized_current_url = `${url.origin}${url.pathname}`
						} catch (error) {
							if (process.env.NODE_ENV !== 'production') {
								console.warn('Failed to sanitize $current_url:', props.$current_url, error)
							}
						}
					}
					if (props.$referrer) {
						try {
							const refUrl = new URL(String(props.$referrer))
							props.$referring_domain = refUrl.hostname // Use PostHog's standard key
							props.sanitized_referrer = refUrl.origin
						} catch (error) {
							if (process.env.NODE_ENV !== 'production') {
								console.warn('Failed to sanitize $referrer:', props.$referrer, error)
							}
						}
					}
					event.properties = props
				} catch (error) {
					if (process.env.NODE_ENV !== 'production') {
						console.warn('Failed to process PostHog event properties:', error)
					}
				}
				return event
			}
		})

		// Apply opt-out state after init if needed (redundant safety check)
		if (trackingBlocked) {
			posthog.opt_out_capturing()
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
}

/**
 * Internal component that handles user identification within the PostHog context
 */
const PosthogUserIdentifier = ({children}: {children: ReactNode}) => {
	const {isLoaded: authLoaded, userId} = useAuth()
	const {isLoaded: userLoaded, user} = useUser()

	useEffect(() => {
		// Only proceed if both auth and user data are loaded and PostHog is available
		if (!authLoaded || !userLoaded || !posthog || !posthog.__loaded) {
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
			if (!userId && posthog && posthog.__loaded) {
				posthog.reset()
			}
		}
	}, [userId])

	return <>{children}</>
}

const CSPostHogProvider = ({children}: { children: ReactNode }) => {
	// Only render PostHogProvider if PostHog is actually initialized
	if (!posthog || !posthog.__loaded) {
		return <>{children}</>
	}

	return (
		<PostHogProvider client={posthog}>
			<PosthogUserIdentifier>
				{children}
			</PosthogUserIdentifier>
		</PostHogProvider>
	)
}

export default CSPostHogProvider
