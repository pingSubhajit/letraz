'use client'

import {useTransitionRouter} from 'next-view-transitions'
import {useSearchParams} from 'next/navigation'
import {useEffect, useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {Button} from '@/components/ui/button'
import {ArrowRight} from 'lucide-react'

const OnboardingCompletionButton = () => {
	const router = useTransitionRouter()
	const searchParams = useSearchParams()
	// Verify we're actually in the onboarding flow (final resume step)
	const isOnboarding = searchParams.get('step') === 'resume'
	const [isVisible, setIsVisible] = useState(false)
	const [isHovered, setIsHovered] = useState(false)

	useEffect(() => {
		// Only show button if we're confirmed to be in onboarding flow
		if (!isOnboarding) return

		// Show button after a delay
		const timer = setTimeout(() => {
			setIsVisible(true)
		}, 3000) // 3-second delay

		return () => clearTimeout(timer)
	}, [isOnboarding])

	const handleGoToDashboard = () => {
		// Use router.replace to prevent back navigation to onboarding
		router.replace('/app?from=onboarding')
	}

	return (
		<AnimatePresence>
			{isVisible && (
				<>
					{/* Backdrop blur overlay */}
					<AnimatePresence>
						{isHovered && (
							<motion.div
								initial={{opacity: 0}}
								animate={{opacity: 1}}
								exit={{opacity: 0}}
								transition={{duration: 0.3}}
								className="fixed inset-0 bg-white/10 backdrop-blur-sm z-40"
								style={{backdropFilter: 'blur(4px)'}}
							/>
						)}
					</AnimatePresence>

					<motion.div
						initial={{opacity: 0, y: 100, x: '-50%'}}
						animate={{opacity: 1, y: 0, x: '-50%'}}
						exit={{opacity: 0, y: 100, x: '-50%'}}
						transition={{
							ease: 'easeOut'
						}}
						className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-neutral-200 flex items-center justify-center rounded-full py-2 pr-2 pl-6 gap-4 shadow-lg"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<div className="text-sm">
							<p>Go on to</p>
							<p className="font-semibold">the Dashboard</p>
						</div>
						<Button
							onClick={handleGoToDashboard}
							size="lg"
							className="rounded-full h-14 text-base"
						>
							Finish & Start Building
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

export default OnboardingCompletionButton
