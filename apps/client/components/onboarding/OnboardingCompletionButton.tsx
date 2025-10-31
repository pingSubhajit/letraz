'use client'

import {useTransitionRouter} from 'next-view-transitions'
import {useSearchParams} from 'next/navigation'
import {useEffect, useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {Button} from '@/components/ui/button'
import {ArrowRight} from 'lucide-react'
import {completeOnboarding} from '@/lib/onboarding/actions'
import {useAnalytics} from '@/lib/analytics'
import {useAuth} from '@clerk/nextjs'
import {cn} from '@/lib/utils'
import {useBaseResumeContextOptional} from '@/components/onboarding/BaseResumeProvider'

const OnboardingCompletionButton = () => {
	const router = useTransitionRouter()
	const searchParams = useSearchParams()
	const {getToken} = useAuth()
	// Verify we're actually in the onboarding flow (final resume step)
	const isOnboarding = searchParams.get('step') === 'resume'
	const [isVisible, setIsVisible] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const {track} = useAnalytics()
	const baseResumeContext = useBaseResumeContextOptional()
	const isBottomSheetExpanded = baseResumeContext?.isBottomSheetExpanded ?? false

	useEffect(() => {
		// Only show button if we're confirmed to be in onboarding flow
		if (!isOnboarding) return

		// Show button after a delay
		const timer = setTimeout(() => {
			setIsVisible(true)
		}, 3000) // 3-second delay

		return () => clearTimeout(timer)
	}, [isOnboarding])

	const handleGoToDashboard = async () => {
		try {
			track('onboarding_completed')
			// Mark onboarding as complete and update step to 'resume'
			await completeOnboarding()
			// Force-refresh session token so claims reflect latest onboarding status
			try {await getToken({skipCache: true})} catch {}
			// Use router.replace to prevent back navigation to onboarding
			router.replace('/app?from=onboarding')
		} catch (error) {
			// Still navigate even if metadata update fails
			router.replace('/app?from=onboarding')
		}
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
						animate={{
							opacity: isBottomSheetExpanded ? 0 : 1,
							y: 0,
							x: '-50%'
						}}
						exit={{opacity: 0, y: 100, x: '-50%'}}
						transition={{
							ease: 'easeOut'
						}}
						className={cn(
							'bg-neutral-200 flex flex-col sm:flex-row items-center justify-center rounded-full shadow-lg',
							'py-0 sm:py-2 pr-0 sm:pr-2 pl-0 sm:pl-6 gap-1 sm:gap-4',
							'max-w-[85vw] sm:max-w-none',
							'fixed bottom-[150px] lg:bottom-6 left-1/2 -translate-x-1/2 z-50',
							'lg:!opacity-100',
							isBottomSheetExpanded && 'pointer-events-none lg:pointer-events-auto'
						)}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<div className="hidden sm:inline text-xs md:text-sm text-center sm:text-left">
							<p>Go on to</p>
							<p className="font-semibold">the Dashboard</p>
						</div>
						<Button
							onClick={handleGoToDashboard}
							size="lg"
							className="rounded-full h-10 sm:h-14 text-xs md:text-base px-3 md:px-6"
						>
							<span className="hidden sm:inline">Finish & Start Building</span>
							<span className="sm:hidden">Finish Onboarding</span>
							<ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

export default OnboardingCompletionButton
