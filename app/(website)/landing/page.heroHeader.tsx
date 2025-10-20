'use client'

import {motion, useMotionTemplate, useScroll, useTransform} from 'motion/react'
import Waitlist from '@/components/Waitlist'
import {useEffect, useState} from 'react'

const HeroHeader = () => {
	const {scrollYProgress} = useScroll()
	const [referrer, setReferrer] = useState<string | undefined>(undefined)

	useEffect(() => {
		try {
			const params = new URLSearchParams(window.location.search)
			setReferrer(params.get('ref') || undefined)
		} catch {}
	}, [])

	// Tighter ranges so the header shrinks/fades with less scroll
	const scale = useTransform(scrollYProgress, [0, 0.10], [1, 0.82])
	const opacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
	const y = useTransform(scrollYProgress, [0, 0.12], [0, -24])
	const blurAmount = useTransform(scrollYProgress, [0, 0.12], [0, 6])
	const filter = useMotionTemplate`blur(${blurAmount}px)`

	return (
		<div
			className="fixed top-24 sm:top-1/4 left-1/2 -translate-x-1/2 -translate-y-0 sm:-translate-y-2/4 py-2 px-4 sm:px-6 lg:px-2 w-full lg:w-auto max-w-[95vw] lg:max-w-none"
			style={{
				transformStyle: 'preserve-3d',
				perspective: '1000px'
			}}
		>
			<motion.div style={{scale, opacity, y, filter}} className="flex flex-col justify-center items-center gap-3 sm:gap-6 lg:gap-8">
				<h1 className="text-[1.75rem] leading-[2rem] sm:text-3xl sm:leading-tight lg:text-4xl lg:text-5xl lg:leading-tight max-w-[90vw] sm:max-w-3xl text-center font-semibold mt-16 lg:mt-0">
					Craft unique resumes tailored for each job you apply for
				</h1>
				<p className="text-xs sm:text-base text-center max-w-[85vw] sm:max-w-md lg:max-w-lg leading-relaxed sm:leading-snug">
					Tailoring resumes is not easy, and let's not get into the time it takes. Letraz does that
					grunt work for you so you can focus on finding and actually landing your dream job
				</p>
				<Waitlist className="relative z-30" referrer={referrer} mode="new" />
			</motion.div>
		</div>
	)
}

export default HeroHeader


