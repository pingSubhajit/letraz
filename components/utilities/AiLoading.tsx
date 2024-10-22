'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {cn} from '@/lib/utils'

const AiLoading = ({
	loading,
	text,
	className,
	videoClass,
	textClass
}: {
	loading: boolean,
	text: string,
	className?: string,
	videoClass?: string,
	textClass?: string
}) => {
	return (
		<AnimatePresence>
			{loading && <motion.div
				className={cn('absolute inset-0 left-1/2 -translate-x-1/2', className)}
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
				initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
			>
				<video
					autoPlay muted loop
					className={cn('aspect-video z-10 h-full scale-150 opacity-60', videoClass)}>
					<source src="/letraz-brain.webm" type="video/webm"/>
				</video>

				<p className={cn(
					'text-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ' +
					'animate-pulse font-semibold',
					textClass
				)}>
					{text}
				</p>
			</motion.div>}
		</AnimatePresence>
	)
}

export default AiLoading
