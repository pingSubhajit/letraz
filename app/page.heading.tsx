'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {cn} from '@/lib/utils'

const LandingPageHeading = ({className}: {className?: string}) => {
	return (
		<AnimatePresence>
			<motion.h1
				className={cn('text-3xl md:text-4xl lg:text-5xl text-center max-w-[700px] lg:max-w-[900px] leading-snug font-medium', className)}
				initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 6.5, duration: 0.7}}
			>
				Craft unique résumés tailored to every job application
			</motion.h1>
		</AnimatePresence>
	)
}

export default LandingPageHeading
