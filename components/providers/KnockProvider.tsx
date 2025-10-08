'use client'

import {ReactNode, useEffect} from 'react'
import {useUser} from '@clerk/nextjs'
import {KnockFeedProvider, KnockProvider as KnockSDKProvider, useKnockFeed} from '@knocklabs/react'

// Component to handle initial notification loading and real-time setup
const NotificationInitializer = () => {
	const {feedClient} = useKnockFeed()

	useEffect(() => {
		const initializeNotifications = async () => {
			await feedClient.fetch()
			// Set up real-time updates
			feedClient.listenForUpdates()
		}

		initializeNotifications()

		// Cleanup on unmount
		return () => {
			feedClient.teardown()
		}
	}, [feedClient])

	return null
}

export const KnockProvider = ({children}: {children: ReactNode}) => {
	const {user, isLoaded} = useUser()

	// Return children early if user is not loaded
	if (!isLoaded) {
		return <>{children}</>
	}

	// Don't initialize Knock if user is not authenticated or doesn't have an email
	const userEmail = user?.emailAddresses?.[0]?.emailAddress
	if (!user || !userEmail) {
		return <>{children}</>
	}

	const apiKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY
	const feedChannelId = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID

	// Don't initialize if environment variables are missing
	if (!apiKey || !feedChannelId) {
		return <>{children}</>
	}

	return (
		<KnockSDKProvider apiKey={apiKey} user={{id: userEmail}}>
			<KnockFeedProvider feedId={feedChannelId} colorMode="light">
				<NotificationInitializer />
				{children}
			</KnockFeedProvider>
		</KnockSDKProvider>
	)
}
