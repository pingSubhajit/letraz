'use client'

import {useState} from 'react'
import {BellIcon} from '@heroicons/react/20/solid'
import {useKnockFeed} from '@knocklabs/react'
import {Button} from '@/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import NotificationFeed from './NotificationFeed'

const NotificationBell = () => {
	const [isOpen, setIsOpen] = useState(false)
	const {useFeedStore} = useKnockFeed()
	const metadata = useFeedStore((state) => state.metadata)

	const unreadCount = metadata?.unread_count || 0

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" className="p-1 aspect-square w-full relative">
					<BellIcon className="fill-primary size-[70%]"/>
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				align="end"
				className="p-0 rounded-xl w-full max-w-lg"
				sideOffset={8}
			>
				<NotificationFeed onNotificationClick={() => setIsOpen(false)} />
			</PopoverContent>
		</Popover>
	)
}

export default NotificationBell
