'use client'

import AppSidebarContainer from '@/components/clientContainers/AppSidebarContainer'
import {useAuth, UserButton} from '@clerk/nextjs'
import {Button} from '@/components/ui/button'
import {Link} from 'next-view-transitions'
import {Cog6ToothIcon} from '@heroicons/react/20/solid'
import Image from 'next/image'
import logo from '@/public/logo_mono_rotated.svg'
import NotificationBell from '@/components/notifications/NotificationBell'

const AppSidebar = () => {
	const auth = useAuth()

	return (
		<AppSidebarContainer className="h-full px-4 pt-24 pb-8 flex flex-col items-center justify-between">
			<Link href="/app"><Image src={logo} alt="Letraz logo" className=""/></Link>
			<div className="flex flex-col items-center justify-end gap-2">
				{auth?.isLoaded && <NotificationBell />}
				<Link href="/app/settings">
					<Button variant="ghost" className="p-1 aspect-square w-full mb-2">
						<Cog6ToothIcon className="fill-primary size-[70%]"/>
					</Button>
				</Link>
				<UserButton
					appearance={{elements: {button: 'w-full'}}}
				/>
			</div>
		</AppSidebarContainer>
	)
}

export default AppSidebar
