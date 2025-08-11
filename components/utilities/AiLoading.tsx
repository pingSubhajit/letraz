'use client'

import {AnimatePresence, motion} from 'motion/react'
import {cn} from '@/lib/utils'

const AiLoading = ({
	loading,
	text,
	className,
	videoClass,
	textClass,
	centered = false
}: {
	loading: boolean,
	text: string,
	className?: string,
	videoClass?: string,
	textClass?: string,
	/**
	 * When true, centers the animation within its parent using flex. When false (default),
	 * preserves the original absolute overlay behavior for backward compatibility.
	 */
	centered?: boolean
}) => {
	return (
		<AnimatePresence>
			{loading && <motion.div
				className={cn(
					centered ? 'absolute inset-0 flex items-center justify-center' : 'absolute inset-0 left-1/2 -translate-x-1/2',
					className
				)}
				initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
			>
				<div className={cn('relative w-full h-full', centered && 'flex items-center justify-center')}>
					<video
						autoPlay
						muted
						loop
						playsInline
						preload="auto"
						className={cn(centered ? 'z-10 opacity-60 max-h-full' : 'aspect-video z-10 h-full scale-150 opacity-60', videoClass)}>
						<source src="/letraz-brain.webm" type="video/webm"/>
					</video>
					<p className={cn(
						'text-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ' +
						'animate-pulse font-semibold',
						textClass
					)}>
						{text}
					</p>
				</div>
			</motion.div>}
		</AnimatePresence>
	)
}

export default AiLoading
