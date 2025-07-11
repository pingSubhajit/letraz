'use client'

import {useKnockFeed} from '@knocklabs/react'
import {format} from 'date-fns'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {ChevronRightIcon} from '@heroicons/react/20/solid'
import {useSidebar} from '@/components/providers/SidebarProvider'
import ScrollMask from '@/components/ui/scroll-mask'

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
				className="h-[95%]"
				data-lenis-prevent
			>
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
									<div className="min-w-0">
										{/* <div className="flex items-center gap-2 mb-1">*/}
										{/*	<h4 className="font-medium text-sm truncate">*/}
										{/*		{title}*/}
										{/*	</h4>*/}
										{/*	{!notification.read_at && (*/}
										{/*		<Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />*/}
										{/*	)}*/}
										{/* </div>*/}
										<div
											className="text-sm line-clamp-2 font-jakarta"
											dangerouslySetInnerHTML={{__html: body}}
										/>
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
			</ScrollMask>
		</div>
	)
}

export default NotificationFeed
