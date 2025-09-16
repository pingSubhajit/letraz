'use client'

import {motion, useMotionTemplate, useScroll, useTransform} from 'motion/react'
import Waitlist from '@/components/Waitlist'

type HeroHeaderProps = {
	referrer?: string
}

const HeroHeader = ({referrer}: HeroHeaderProps) => {
	const {scrollYProgress} = useScroll()

	// Tighter ranges so the header shrinks/fades with less scroll
	const scale = useTransform(scrollYProgress, [0, 0.10], [1, 0.82])
	const opacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
	const y = useTransform(scrollYProgress, [0, 0.12], [0, -24])
	const blurAmount = useTransform(scrollYProgress, [0, 0.12], [0, 6])
	const filter = useMotionTemplate`blur(${blurAmount}px)`

	return (
		<div
			className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-2/4 py-2"
			style={{
				transformStyle: 'preserve-3d',
				perspective: '1000px'
			}}
		>
			<motion.div style={{scale, opacity, y, filter}} className="flex flex-col justify-center items-center gap-8">
				<h1 className="text-5xl max-w-3xl text-center leading-tight font-semibold">
					Craft unique resumes tailored for each job you apply for
				</h1>
				<p className="text-center max-w-lg leading-snug">
					Tailoring resumes is not easy, and let’s not get into the time it takes. Letraz does that
					grunt work for you so you can focus on finding and actually landing your dream job
				</p>
				<Waitlist className="relative z-30" referrer={referrer} mode="new" />
			</motion.div>
		</div>
	)
}

export default HeroHeader


