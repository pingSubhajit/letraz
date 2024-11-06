'use client'

import {cn} from '@/lib/utils'
import {motion} from 'framer-motion'

const AboutDescription = ({className}: {className?: string}) => {
	return (
		<motion.div
			className={cn('max-w-3xl text-2xl text-center mt-16', className)}
			{...({} as any)}
			// Framer-motion types are broken as of 22/10/2024
			initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
		>
			<p>
				From no resume to the best suited resume for the specific job you are eyeing at, in no time.
				We'll guide you through the entire process.
			</p>

			<div className="mt-10 space-y-3">
				<p>Answer a few questions about yourself</p>
				<p>Let us create your base resume</p>
				<p>Drop in the job description</p>
				<p>We will create your first tailored resume</p>
				<p>Download and apply with confidence</p>
			</div>
		</motion.div>
	)
}

export default AboutDescription
