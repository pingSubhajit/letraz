'use client'

import AppSidebarContainer from '@/components/clientContainers/AppSidebarContainer'
import {UserButton} from '@clerk/nextjs'
import {Link} from 'next-view-transitions'
import Image from 'next/image'
import logo from '@/public/logo_mono_rotated.svg'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserSupport from '@/components/UserSupport'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import {KnockProvider} from '@/components/providers/KnockProvider'

const AppSidebar = () => {
	return (
		<AppSidebarContainer className="h-full px-4 pt-24 pb-8 flex flex-col items-center justify-between">
			<Link href="/app"><Image src={logo} alt="Letraz logo" className=""/></Link>
			<div className="flex flex-col items-center justify-end gap-2">
				<TooltipProvider>
					<KnockProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="w-full"><NotificationBell /></span>
							</TooltipTrigger>
							<TooltipContent side="right">Notifications</TooltipContent>
						</Tooltip>
					</KnockProvider>
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
