'use client'

import {useAuth, UserButton} from '@clerk/nextjs'
import {Link} from 'next-view-transitions'
import Image from 'next/image'
import logo from '@/public/logo_mono.svg'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserSupport from '@/components/UserSupport'

const MobileNavbar = () => {
	const auth = useAuth()

	return (
		<nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
			<div className="h-14 px-4 flex items-center justify-between">
				{/* Logo on the left */}
				<Link href="/app" className="flex items-center">
					<Image
						src={logo}
						alt="Letraz logo"
						className="h-8 w-auto"
						style={{height: '16px', width: 'auto'}}
						priority
					/>
				</Link>

				{/* Icons on the right */}
				<div className="flex items-center gap-3">
					{auth?.isLoaded && (
						<div className="flex items-center justify-center">
							<NotificationBell />
						</div>
					)}
					<div className="flex items-center justify-center">
						<UserSupport />
					</div>
					<div className="flex items-center justify-center">
						<UserButton
							appearance={{
								elements: {
									avatarBox: 'h-8 w-8'
								}
							}}
						/>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default MobileNavbar
