'use client'

import {AnimatePresence, motion} from 'motion/react'
import {usePathname} from 'next/navigation'
import {ReactNode} from 'react'
import {useSidebar} from '@/components/providers/SidebarProvider'
import NotificationFeed from '@/components/notifications/NotificationFeed'

const AppSidebarContainer = ({children, className}: {
	children: ReactNode,
	className?: string,
}) => {
	const pathname = usePathname()
	const {isExpanded, currentPage} = useSidebar()

	/*
	 * Only animate the sidebar on onboarding pages for a smoother initial experience,
	 * while keeping the UI snappy and immediate on all other application pages
	 */
	const shouldAnimate = pathname.startsWith('/app/onboarding')

	// Calculate width based on expanded state
	const collapsedWidth = '80px'
	const expandedWidth = '400px'
	const targetWidth = isExpanded ? expandedWidth : collapsedWidth

	return (
		<motion.aside
			className="shadow-xl z-20"
			initial={shouldAnimate ? {width: '0px'} : {width: collapsedWidth}}
			animate={{width: targetWidth}}
			transition={{
				ease: 'circInOut',
				duration: 0.3
			}}
		>
			<motion.div
				initial={shouldAnimate ? {x: '-80px', width: collapsedWidth} : {width: collapsedWidth}}
				animate={{x: 0, width: targetWidth}}
				transition={{
					ease: 'circInOut',
					duration: 0.3
				}}
				className="h-full bg-primary-foreground/90 relative"
			>
				<AnimatePresence>
					{!isExpanded && <motion.div
						className={className}
						initial={{scale: 0.95, opacity: 0}}
						animate={{scale: 1, opacity: 1}}
						exit={{scale: 0.95, opacity: 0}}
					>
						{children}
					</motion.div>}
				</AnimatePresence>

				<AnimatePresence>
					{isExpanded && <motion.div
						className="h-full w-full px-4 pt-8 flex flex-col items-center justify-between absolute z-20 inset-0"
						initial={{x: -400}}
						animate={{x: 0}}
						exit={{x: -400}}
						transition={{
							ease: 'circInOut',
							duration: 0.3
						}}
					>
						{currentPage === 'NOTIFICATION' && <NotificationFeed />}
					</motion.div>}
				</AnimatePresence>
			</motion.div>
		</motion.aside>
	)
}

export default AppSidebarContainer
