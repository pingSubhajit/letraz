'use client'

import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'

const LandingPageDescription = ({className}: {className?: string}) => {
	return (
		<motion.p
			className={cn('font-bold text-primary/50', className)}
			{...({} as any)}
			// Framer-motion types are broken as of 22/10/2024
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
		>
			Enter your email below to be notified of updates and when we launch.
		</motion.p>
	)
}

export default LandingPageDescription
