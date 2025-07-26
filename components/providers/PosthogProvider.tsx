'use client'

import posthog from 'posthog-js'
import {PostHogProvider} from 'posthog-js/react'
import {ReactNode, useEffect} from 'react'
import {useAuth, useUser} from '@clerk/nextjs'
import {defaultUrl} from '@/config'

if (typeof window !== 'undefined') {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		person_profiles: 'always',
		// Enhanced filtering to ensure only production events are captured
		opt_out_capturing_by_default: false,
		capture_pageview: true,
		capture_pageleave: true,
		// Additional security and performance options
		secure_cookie: true,
		persistence: 'localStorage',
		// Custom event filtering based on environment
		before_send: (event) => {
			// Only allow events from production domain
			const currentHost = window.location.hostname
			const isProduction = currentHost === 'letraz.app' || currentHost === 'www.letraz.app'

			if (!isProduction) {
				return null // Block the event
			}

			return event // Allow the event
		}
	})
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
		} else {
			// User is not authenticated, reset to anonymous
			posthog.reset()

			// Set anonymous user group
			posthog.group('user_segment', 'anonymous')
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
	// Enhanced domain filtering logic
	const currentUrl = typeof window !== 'undefined' ? window.location.hostname : defaultUrl

	// Only enable PostHog on production domains
	const isProductionDomain = currentUrl === 'letraz.app' || currentUrl === 'www.letraz.app'

	// Block PostHog for development, preview, and non-production environments
	if (!isProductionDomain || process.env.NODE_ENV !== 'production') {
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
