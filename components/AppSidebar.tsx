'use client'

import AppSidebarContainer from '@/components/clientContainers/AppSidebarContainer'
import {useAuth, UserButton} from '@clerk/nextjs'
import {Link} from 'next-view-transitions'
import Image from 'next/image'
import logo from '@/public/logo_mono_rotated.svg'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserSupport from '@/components/UserSupport'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'

const AppSidebar = () => {
	const auth = useAuth()

	return (
		<AppSidebarContainer className="h-full px-4 pt-24 pb-8 flex flex-col items-center justify-between">
			<Link href="/app"><Image src={logo} alt="Letraz logo" className=""/></Link>
			<div className="flex flex-col items-center justify-end gap-2">
				<TooltipProvider>
					{auth?.isLoaded && (
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="w-full"><NotificationBell /></span>
							</TooltipTrigger>
							<TooltipContent side="right">Notifications</TooltipContent>
						</Tooltip>
					)}
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="w-full"><UserSupport /></span>
						</TooltipTrigger>
						<TooltipContent side="right">Help & support</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild className="w-full">
							<span className="w-full mt-2 text-center">
								<UserButton />
							</span>
						</TooltipTrigger>
						<TooltipContent side="right">Manage account</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</AppSidebarContainer>
	)
}

export default AppSidebar
