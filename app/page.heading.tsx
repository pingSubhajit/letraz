'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {cn} from '@/lib/utils'

const LandingPageHeading = ({className}: {className?: string}) => {
	return (
		<AnimatePresence>
			<motion.h1
				className={cn('text-3xl md:text-4xl lg:text-5xl max-w-[700px] lg:max-w-[900px] lg:leading-snug font-bold', className)}
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
				initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.7}}
			>
				Craft unique résumés tailored to every job application
			</motion.h1>
		</AnimatePresence>
	)
}

export default LandingPageHeading
