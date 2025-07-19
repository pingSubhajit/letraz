'use client'

import {useKnockFeed} from '@knocklabs/react'
import {formatDistanceToNow} from 'date-fns'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {Button} from '@/components/ui/button'
import {Check, CheckCheck, ChevronLeft, X} from 'lucide-react'
import {BellIcon as Bell} from '@heroicons/react/20/solid'
import {useSidebar} from '@/components/providers/SidebarProvider'
import ScrollMask from '@/components/ui/scroll-mask'
import {NotificationSender, senders} from '@/components/notifications/NOTIFICATION_MAPPING'
import Image from 'next/image'
import {FeedItem} from '@knocklabs/client'
import {sanitizeHtml} from '@/lib/utils'

interface NotificationFeedProps {
	onNotificationClick?: () => void
}

const NotificationFeed = ({onNotificationClick}: NotificationFeedProps) => {
	const {collapseSidebar, isExpanded} = useSidebar()
	const [parent] = useAutoAnimate()

	const {useFeedStore, feedClient} = useKnockFeed()
	const items = useFeedStore((state) => state.items)
	const metadata = useFeedStore((state) => state.metadata)
	const loading = useFeedStore((state) => state.loading)

	const handleNotificationClick = (notification: FeedItem) => {
		// Mark notification as read
		feedClient.markAsRead([notification])
		onNotificationClick?.()
	}

	const handleMarkAllAsRead = () => {
		feedClient.markAllAsRead()
	}

	const handleMarkAsRead = (notification: FeedItem, event: React.MouseEvent) => {
		event.stopPropagation()
		feedClient.markAsRead([notification])
	}

	const handleDismiss = (notification: FeedItem, event: React.MouseEvent) => {
		event.stopPropagation()
		feedClient.markAsArchived([notification])
	}

	// Helper function to get notification content
	const getNotificationContent = (notification: FeedItem) => {
		const firstBlock = notification.blocks?.[0]
		if (!firstBlock) return 'No content'

		let content = 'No content'

		if ('rendered' in firstBlock) {
			content = firstBlock.rendered || firstBlock.content || 'No content'
		}

		return sanitizeHtml(content)
	}

	// Helper function to find matching sender from categories
	const getSender = (categories: string[]): NotificationSender => {
		if (!categories || categories.length === 0) return senders.default

		const matchingCategory = categories.find(category => Object.keys(senders).includes(category)) as keyof typeof senders
		return matchingCategory ? senders[matchingCategory] : senders.default // Default fallback
	}

	return (
		<div className="h-full w-full flex flex-col bg-background">
			{/* Header */}
			<div className="flex items-center justify-between py-4 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={collapseSidebar}
					>
						<ChevronLeft
							className="h-4 w-4"
						/>
					</Button>
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-lg">Notifications</h3>
						{metadata?.unread_count > 0 && (
							<div className="bg-flame-500 text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
								{metadata.unread_count}
							</div>
						)}
					</div>
				</div>
				{metadata?.unread_count > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleMarkAllAsRead}
						className="text-xs h-8 px-3 hover:bg-accent/50"
					>
						<CheckCheck className="h-3 w-3 mr-1" />
						Mark all read
					</Button>
				)}
			</div>

			{/* Loading State */}
			{loading && (
				<div className="flex-1 p-4 space-y-4">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="flex items-start gap-3 animate-pulse">
							<div className="w-12 h-12 bg-muted rounded-full" />
							<div className="flex-1 space-y-2">
								<div className="flex items-center justify-between">
									<div className="h-4 bg-muted rounded w-24" />
									<div className="h-3 bg-muted rounded w-16" />
								</div>
								<div className="h-4 bg-muted rounded w-full" />
								<div className="h-4 bg-muted rounded w-2/3" />
							</div>
						</div>
					))}
				</div>
			)}

			{/* Empty State */}
			{!loading && (!items || items.length === 0) && (
				<div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
					<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
						<Bell className="h-8 w-8" />
					</div>
					<div className="space-y-2">
						<h3 className="font-medium text-foreground">No notifications yet</h3>
						<p className="text-sm text-muted-foreground max-w-xs">
							You'll see updates about your resumes, jobs, and account activity here.
						</p>
					</div>
				</div>
			)}

			{/* Notifications List */}
			{!loading && items && items.length > 0 && (
				<ScrollMask
					className="flex-1 font-jakarta"
					data-lenis-prevent
				>
					<div className="divide-y divide-border" ref={parent}>
						{items.map((notification) => {
							const content = getNotificationContent(notification)
							const sender = getSender(notification.source.categories)

							return (
								<div
									key={notification.id}
									className={`group relative p-4 px-6 cursor-pointer hover:bg-accent/50 transition-all duration-200 ${
										notification.read_at ? 'opacity-75' : 'bg-accent/20'
									}`}
									onClick={() => handleNotificationClick(notification)}
								>
									{/* Hover Overlay */}
									<div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-primary-foreground to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-10 flex items-end justify-end pb-3 pr-3">
										<div className="flex items-center gap-1">
											{!notification.read_at && (
												<button
													className="p-1.5 rounded-full opacity-60 hover:opacity-100 focus-visible:opacity-100 hover:text-flame-600 focus-visible:text-flame-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500 focus-visible:ring-offset-2 transition-all duration-200"
													onClick={(e) => handleMarkAsRead(notification, e)}
													title="Mark as read"
													aria-label="Mark notification as read"
												>
													<Check className="h-4 w-4" />
												</button>
											)}
											<button
												className="p-1.5 rounded-full opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500 focus-visible:ring-offset-2 transition-all duration-200"
												onClick={(e) => handleDismiss(notification, e)}
												title="Dismiss"
												aria-label="Dismiss notification"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									</div>

									<div className="flex items-start gap-3 pl-2">
										{/* Avatar */}
										<div className="relative">
											<Image
												src={sender.avatar}
												alt={sender.name}
												width={48}
												height={48}
												className="w-12 h-12 rounded-full ring-2 ring-transparent group-hover:ring-flame-500/80 transition-all duration-200"
											/>
											{!notification.read_at && (
												<div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-flame-500 rounded-full border-2 border-flame-500" />
											)}
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0 space-y-1">
											<div className="flex items-start justify-between gap-2">
												<p className="text-sm font-medium text-foreground leading-tight">
													{sender.name}
												</p>
												<p className="text-xs text-muted-foreground shrink-0">
													{formatDistanceToNow(new Date(notification.inserted_at), {addSuffix: true})}
												</p>
											</div>
											<div
												className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none [&>*]:my-0"
												dangerouslySetInnerHTML={{__html: content}}
											/>
										</div>
									</div>

									{/* Hover indicator */}
									<div className="absolute inset-y-0 right-0 w-1 bg-flame-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
								</div>
							)
						})}
					</div>
				</ScrollMask>
			)}
		</div>
	)
}

export default NotificationFeed
