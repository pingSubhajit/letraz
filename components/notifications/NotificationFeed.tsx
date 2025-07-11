'use client'

import {useKnockFeed} from '@knocklabs/react'
import {format} from 'date-fns'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {ChevronRightIcon} from '@heroicons/react/20/solid'
import {useSidebar} from '@/components/providers/SidebarProvider'
import ScrollMask from '@/components/ui/scroll-mask'
import {NotificationSender, senders} from './NOTIFICATION_MAPPING'
import Image from 'next/image'

interface NotificationFeedProps {
	onNotificationClick?: () => void
}

const NotificationFeed = ({onNotificationClick}: NotificationFeedProps) => {
	const {collapseSidebar, isExpanded} = useSidebar()

	const {useFeedStore, feedClient} = useKnockFeed()
	const items = useFeedStore((state) => state.items)
	const metadata = useFeedStore((state) => state.metadata)
	const loading = useFeedStore((state) => state.loading)

	const handleNotificationClick = (notification: any) => {
		// Mark notification as read
		feedClient.markAsRead([notification])
		onNotificationClick?.()
	}

	const handleMarkAllAsRead = () => {
		feedClient.markAllAsRead()
	}

	// Helper function to get notification content
	const getNotificationContent = (notification: any) => {
		const firstBlock = notification.blocks?.[0]
		if (!firstBlock) return {title: 'Notification', body: 'No content'}

		const content = firstBlock.rendered || firstBlock.content || 'No content'

		// Extract title from content (first sentence or first 50 chars)
		const title = content.split('.')[0] || content.substring(0, 50) + (content.length > 50 ? '...' : '')

		return {
			title: title.replace(/[#*]/g, '').trim(), // Remove markdown formatting
			body: content
		}
	}

	// Helper function to find matching sender from categories
	const getSender = (categories: string[]): NotificationSender => {
		if (!categories || categories.length === 0) return senders.default

		const matchingCategory = categories.find(category => Object.keys(senders).includes(category)) as keyof typeof senders
		return matchingCategory ? senders[matchingCategory] : senders.default // Default fallback
	}

	return (
		<div className="h-full w-full flex flex-col justify-between items-start">
			<div className="flex items-center justify-between border-b">
				<div className="flex items-center">
					<Button
						variant="ghost"
						className="p-1 aspect-square w-full"
						onClick={collapseSidebar}
					>
						<ChevronRightIcon
							className={`fill-primary size-[70%] transition-transform duration-200 ${
								isExpanded ? 'rotate-180' : ''
							}`}
						/>
					</Button>
					<h3 className="font-semibold">Notifications</h3>
				</div>
				{metadata?.unread_count > 0 && (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleMarkAllAsRead}
						className="text-xs"
					>
						Mark all as read
					</Button>
				)}
			</div>

			{loading && <div className="text-center text-muted-foreground">
				Loading notifications...
			</div>}

			{(!items || items.length === 0) && <div className="text-center text-muted-foreground">
				<p>No notifications yet</p>
			</div>}

			<ScrollMask
				className="h-[95%] font-jakarta"
				data-lenis-prevent
			>
				{items.map((notification) => {
					const {title, body} = getNotificationContent(notification)

					return (
						<div key={notification.id}>
							<div
								className={`py-3 cursor-pointer hover:bg-accent/50 transition-colors ${
									notification.read_at ? 'opacity-75' : ''
								}`}
								onClick={() => handleNotificationClick(notification)}
							>
								<div className="flex items-start justify-between gap-3">
									<Image
										src={getSender(notification.source.categories).avatar}
										alt={getSender(notification.source.categories).name}
										width={256} height={256}
										className="w-12 rounded-full"
									/>
									<div className="min-w-0 space-y-0.5">
										<div className="flex items-center justify-between">
											<p className="text-sm font-medium">
												{getSender(notification.source.categories).name}
											</p>
											<p className="text-xs text-muted-foreground">
												{format(new Date(notification.inserted_at), 'MMM d, h:mm a')}
											</p>
										</div>
										<div
											className="text-sm"
											dangerouslySetInnerHTML={{__html: body}}
										/>
									</div>
								</div>
							</div>
							<Separator />
						</div>
					)
				})}
			</ScrollMask>
		</div>
	)
}

export default NotificationFeed
