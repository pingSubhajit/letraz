'use client'

import {ReactNode, useEffect} from 'react'
import {useAuth, useUser} from '@clerk/nextjs'
import * as Sentry from '@sentry/nextjs'

interface SentryUserProviderProps {
	children: ReactNode
}

/**
 * Provider component that automatically identifies users in Sentry based on Clerk authentication.
 * This component should be placed after ClerkProvider in the component tree.
 */
export const SentryUserProvider = ({children}: SentryUserProviderProps) => {
	const {isLoaded: authLoaded, userId} = useAuth()
	const {isLoaded: userLoaded, user} = useUser()

	useEffect(() => {
		// Only proceed if both auth and user data are loaded
		if (!authLoaded || !userLoaded) {
			return
		}

		// If user is authenticated, set user context in Sentry
		if (userId && user) {
			const sentryUser = {
				id: userId,
				email: user.emailAddresses[0]?.emailAddress,
				username: user.username || user.fullName || 'Unknown User',
				// Add additional safe user metadata
				segment: 'authenticated'
			}

			// Set user context on both current scope and global scope for maximum compatibility
			Sentry.getCurrentScope().setUser(sentryUser)
			Sentry.setUser(sentryUser)

			// Set additional context tags
			Sentry.getCurrentScope().setTag('user.onboardingComplete', user.publicMetadata?.onboardingComplete || false)
			Sentry.getCurrentScope().setTag('user.currentStep', user.publicMetadata?.currentOnboardingStep || 'unknown')
			Sentry.setTag('user.onboardingComplete', user.publicMetadata?.onboardingComplete || false)
			Sentry.setTag('user.currentStep', user.publicMetadata?.currentOnboardingStep || 'unknown')
		} else {
			// User is not authenticated, set anonymous context
			const anonymousUser = {segment: 'anonymous'}

			Sentry.getCurrentScope().setUser(anonymousUser)
			Sentry.getCurrentScope().setTag('user.onboardingComplete', null)
			Sentry.getCurrentScope().setTag('user.currentStep', null)

			Sentry.setUser(anonymousUser)
			Sentry.setTag('user.onboardingComplete', null)
			Sentry.setTag('user.currentStep', null)
		}
	}, [authLoaded, userLoaded, userId, user])

	// Handle cleanup when component unmounts
	useEffect(() => {
		return () => {
			// Clear user context on unmount to prevent stale data
			if (!userId) {
				Sentry.setUser(null)
			}
		}
	}, [userId])

	return <>{children}</>
}

export default SentryUserProvider
