'use client'

import AppSidebarContainer from '@/components/clientContainers/AppSidebarContainer'
import {useAuth, UserButton} from '@clerk/nextjs'
import {Link} from 'next-view-transitions'
import Image from 'next/image'
import logo from '@/public/logo_mono_rotated.svg'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserSupport from '@/components/UserSupport'

const AppSidebar = () => {
	const auth = useAuth()

	return (
		<AppSidebarContainer className="h-full px-4 pt-24 pb-8 flex flex-col items-center justify-between">
			<Link href="/app"><Image src={logo} alt="Letraz logo" className=""/></Link>
			<div className="flex flex-col items-center justify-end gap-2">
				{auth?.isLoaded && <NotificationBell />}
				<UserSupport />
				<UserButton
					appearance={{elements: {button: 'w-full mt-2'}}}
				/>
			</div>
		</AppSidebarContainer>
	)
}

export default AppSidebar
