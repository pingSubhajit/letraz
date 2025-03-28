'use client'

import {motion} from 'motion/react'
import {usePathname} from 'next/navigation'
import {ReactNode} from 'react'

const AppSidebarContainer = ({children, className}: {children: ReactNode, className?: string}) => {
	const pathname = usePathname()


	/*
	 * Only animate the sidebar on onboarding pages for a smoother initial experience,
	 * while keeping the UI snappy and immediate on all other application pages
	 */
	const shouldAnimate = pathname.startsWith('/app/onboarding')

	return (
		<motion.aside
			className="w-20 shadow-xl z-20"
			initial={ shouldAnimate ? {width: '0px'} : false} animate={{width: '80px'}} transition={{
				type: 'tween',
				ease: 'easeInOut'
			}}
		>
			<motion.div
				initial={ shouldAnimate ? {x: '-80px'} : false} animate={{x: 0}} transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className={className}
			>
				{children}
			</motion.div>
		</motion.aside>
	)
}

export default AppSidebarContainer
