'use client'

import {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {AnimatePresence, motion} from 'motion/react'

// Define StaggeredText component outside to prevent recreation on every render
const StaggeredText = ({text, show}: { text: string; show: boolean }) => {
	const letters = Array.from(text)

	return (
		<motion.h2
			className="text-5xl leading-normal flex overflow-hidden"
			initial="hidden"
			animate={show ? 'visible' : 'exit'}
			variants={{
				hidden: {},
				visible: {
					transition: {staggerChildren: 0.01, delayChildren: 0.2}
				},
				exit: {
					transition: {staggerChildren: 0.01, delayChildren: 0}
				}
			}}
		>
			{letters.map((letter, index) => (
				<motion.span
					key={index}
					variants={{
						hidden: {
							y: '200%',
							transition: {ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85}
						},
						visible: {
							y: 0,
							transition: {ease: [0.125, 0.92, 0.69, 0.975], duration: 0.75}
						},
						exit: {
							y: '-200%',
							transition: {ease: [0.455, 0.03, 0.515, 0.955], duration: 0.75}
						}
					}}
				>
					{letter === ' ' ? '\u00A0' : letter}
				</motion.span>
			))}
		</motion.h2>
	)
}

const OnboardingWelcome = () => {
	const searchParams = useSearchParams()
	const fromOnboarding = searchParams.get('from')

	const [showWelcome, setShowWelcome] = useState(false)
	const [showText, setShowText] = useState(false)
	const [startReveal, setStartReveal] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

	useEffect(() => {
		if (fromOnboarding === 'onboarding') {
			/*
			 * Timeline:
			 * 1. Show white screen immediately
			 */
			setShowWelcome(true)

			// 2. Show "Welcome" text after brief delay
			const textTimer = setTimeout(() => {
				setShowText(true)
			}, 300)

			// 3. Hide text (now stays 1 second longer)
			const revealTimer = setTimeout(() => {
				setShowText(false)
				setStartReveal(true)
			}, 3000) // Was 2000, now 3000 (1 second longer)

			// 4. Complete the sequence (adjusted for longer timing)
			const completeTimer = setTimeout(() => {
				setIsComplete(true)
			}, 7800) // Was 4500, now adjusted for new timing

			return () => {
				clearTimeout(textTimer)
				clearTimeout(revealTimer)
				clearTimeout(completeTimer)
			}
		}
	}, [fromOnboarding])

	if (!fromOnboarding || fromOnboarding !== 'onboarding' || isComplete) {
		return null
	}

	return (
		<AnimatePresence>
			{showWelcome && (
				<motion.div
					initial={{opacity: 1}}
					exit={{opacity: 0}}
					className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
					style={{
						// Create circular mask with soft, blurred edges for dreamy effect
						mask: startReveal
							? `radial-gradient(circle at center, 
								transparent calc(var(--hole-size, 0%) - 8%), 
								rgba(255,255,255,0.1) calc(var(--hole-size, 0%) - 4%), 
								rgba(255,255,255,0.5) calc(var(--hole-size, 0%) - 2%), 
								white var(--hole-size, 0%))`
							: undefined,
						WebkitMask: startReveal
							? `radial-gradient(circle at center, 
								transparent calc(var(--hole-size, 0%) - 8%), 
								rgba(255,255,255,0.1) calc(var(--hole-size, 0%) - 4%), 
								rgba(255,255,255,0.5) calc(var(--hole-size, 0%) - 2%), 
								white var(--hole-size, 0%))`
							: undefined
					}}
					animate={{
						'--hole-size': startReveal ? '120%' : '0%'
					} as any}
					transition={{
						opacity: {duration: 0.3},
						'--hole-size': {
							duration: 2.5,
							ease: [0.25, 0.1, 0.25, 1], // Custom bezier for smoother animation
							delay: 1.3 // Was 0.3, now 1.3 (1 second later after text goes away)
						}
					} as any}
				>
					{/* Custom staggered text with matching entrance and exit animations */}
					<StaggeredText text="Welcome" show={showText} />
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default OnboardingWelcome
