'use client'

import {motion} from 'framer-motion'
import {ReactNode} from 'react'

const AppSidebarContainer = ({children, className}: {children: ReactNode, className?: string}) => {
	return (
		<motion.aside
			className="w-20 shadow-xl"
			{...({} as any)}
			// Framer-motion types are broken as of 22/10/2024
			initial={{width: '0px'}} animate={{width: '80px'}} transition={{
				type: 'tween',
				ease: 'easeInOut'
			}}
		>
			<motion.div
				initial={{x: '-80px'}} animate={{x: 0}} transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className={className}
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
			>
				{children}
			</motion.div>
		</motion.aside>
	)
}

export default AppSidebarContainer
