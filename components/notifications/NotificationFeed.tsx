'use client'

import {useKnockFeed} from '@knocklabs/react'
import {format} from 'date-fns'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'

interface NotificationFeedProps {
	onNotificationClick?: () => void
}

const NotificationFeed = ({onNotificationClick}: NotificationFeedProps) => {
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

		const content = firstBlock.content || firstBlock.rendered || 'No content'

		// Extract title from content (first sentence or first 50 chars)
		const title = content.split('.')[0] || content.substring(0, 50) + (content.length > 50 ? '...' : '')

		return {
			title: title.replace(/[#*]/g, '').trim(), // Remove markdown formatting
			body: content
		}
	}

	if (loading) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Loading notifications...
			</div>
		)
	}

	if (!items || items.length === 0) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				<p>No notifications yet</p>
			</div>
		)
	}

	return (
		<div className="max-h-96">
			<div className="flex items-center justify-between p-4 border-b">
				<h3 className="font-semibold">Notifications</h3>
				{metadata?.unread_count > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleMarkAllAsRead}
						className="text-xs"
					>
						Mark all as read
					</Button>
				)}
			</div>
			<ScrollArea className="max-h-80">
				<div className="space-y-1">
					{items.map((notification) => {
						const {title, body} = getNotificationContent(notification)

						return (
							<div key={notification.id}>
								<div
									className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
										notification.read_at ? 'opacity-75' : ''
									}`}
									onClick={() => handleNotificationClick(notification)}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-medium text-sm truncate">
													{title}
												</h4>
												{!notification.read_at && (
													<Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
												)}
											</div>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{body}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												{format(new Date(notification.inserted_at), 'MMM d, h:mm a')}
											</p>
										</div>
									</div>
								</div>
								<Separator />
							</div>
						)
					})}
				</div>
			</ScrollArea>
		</div>
	)
}

export default NotificationFeed
