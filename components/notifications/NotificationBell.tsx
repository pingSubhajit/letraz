'use client'

import {BellIcon} from '@heroicons/react/20/solid'
import {useKnockFeed} from '@knocklabs/react'
import {Button} from '@/components/ui/button'
import {useSidebar} from '@/components/providers/SidebarProvider'

const NotificationBell = () => {
	const {openNotification} = useSidebar()

	const {useFeedStore} = useKnockFeed()
	const metadata = useFeedStore((state) => state.metadata)
	const unreadCount = metadata?.unread_count || 0

	return (
		<Button onClick={openNotification} variant="ghost" className="p-1 aspect-square w-full relative">
			<BellIcon className="fill-primary size-[70%]"/>
			{unreadCount > 0 && (
				<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
					{unreadCount > 99 ? '99+' : unreadCount}
				</span>
			)}
		</Button>
	)
}

export default NotificationBell
