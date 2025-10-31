'use client'

import {motion} from 'motion/react'
import {useEffect, useState} from 'react'

type ResumeRevealOverlayProps = {
	/** Total animation duration in seconds for the primary sweep */
	durationSeconds?: number
	/** When true, the overlay unmounts itself after the animation completes */
	autoHide?: boolean
}

const ResumeRevealOverlay = ({durationSeconds = 4, autoHide = true}: ResumeRevealOverlayProps) => {
	const [visible, setVisible] = useState(true)

	useEffect(() => {
		if (!autoHide) return
		// Account for the longest child delay (~0.05s) with a small buffer
		const timeout = window.setTimeout(() => setVisible(false), (durationSeconds + 0.15) * 1000)
		return () => window.clearTimeout(timeout)
	}, [autoHide, durationSeconds])

	if (!visible) return null

	return (
		<>
			<motion.div
				className="absolute inset-0 bg-neutral-50 z-10 pointer-events-none"
				initial={{top: '-20%', left: 0, right: 0, bottom: 0}}
				animate={{top: '135%', left: 0, right: 0, bottom: 0}}
				transition={{duration: durationSeconds, ease: 'easeInOut'}}
			/>

			<motion.div
				className="absolute inset-0 bg-transparent backdrop-blur-sm z-10 pointer-events-none"
				initial={{top: '-20%', left: 0, right: 0, bottom: 0}}
				animate={{top: '135%', left: 0, right: 0, bottom: 0}}
				transition={{duration: durationSeconds, ease: 'easeInOut', delay: 0.05}}
			/>

			<motion.div
				className="absolute inset-0 pointer-events-none"
				initial={{top: '-20%', left: 0, right: 0, bottom: 0}}
				animate={{top: '120%', left: 0, right: 0, bottom: 0}}
				transition={{duration: durationSeconds, ease: 'easeInOut', delay: 0.02}}
			>
				<div className="w-[150px] h-[65px] absolute bg-rose-500/70 rounded-[50%] z-10 top-0 left-0 blur-[75px] opacity-65"/>
				<div className="w-[600px] h-[75px] absolute bg-flame-500/70 rounded-[50%] z-10 top-0 right-16 blur-[75px] opacity-65"/>
				<div className="w-[200px] h-[85px] absolute bg-amber-300/70 rounded-[50%] z-10 top-0 right-0 blur-[75px] opacity-65"/>
			</motion.div>
		</>
	)
}

export default ResumeRevealOverlay


