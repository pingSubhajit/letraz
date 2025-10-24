'use client'

import {AnimatePresence, motion} from 'motion/react'
import {cn} from '@/lib/utils'
import {OnboardingStep} from '@/app/app/onboarding/types'
import {RefObject, useEffect, useState} from 'react'

type Props = {
	className?: string
	onboardingStep: OnboardingStep
	ref?: RefObject<HTMLVideoElement | null>
}

const BrainAnimation = ({className, onboardingStep, ref}: Props) => {
	const [windowWidth, setWindowWidth] = useState(0)

	useEffect(() => {
		// Set initial width
		setWindowWidth(window.innerWidth)

		// Update width on resize
		const handleResize = () => setWindowWidth(window.innerWidth)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Breakpoints (matching Tailwind)
	const isMobile = windowWidth < 640 // below sm
	const isSm = windowWidth >= 640 && windowWidth < 768 // sm to md
	const isMd = windowWidth >= 768 && windowWidth < 1024 // md to lg
	// lg and above is implicit (>= 1024px)

	const isEducationOrExperience = onboardingStep === OnboardingStep.EDUCATION || onboardingStep === OnboardingStep.EXPERIENCE
	const isWelcome = onboardingStep === OnboardingStep.WELCOME

	// Get responsive animation values
	const getAnimateValues = () => {
		// WELCOME PAGE: Always centered at all breakpoints
		if (isWelcome) {
			return {
				scale: 1,
				top: '0',
				right: '0'
			}
		}

		// EDUCATION & EXPERIENCE PAGES
		if (isEducationOrExperience) {
			if (isMobile) {
				// Mobile (<640px): Centered
				return {
					scale: 1.0,
					top: '0',
					right: '0'
				}
			} else if (isSm) {
				// sm (640-767px): Centered
				return {
					scale: 1.0,
					top: '0',
					right: '0'
				}
			} else if (isMd) {
				// md (768-1023px): Positioned right with 70% total scale
				return {
					scale: 1,
					top: '0',
					right: '0'
				}
			} else {
				// lg+ (1024px+): Desktop - positioned right with original scale
				return {
					scale: 1,
					top: '0',
					right: '-25%'
				}
			}
		}

		// OTHER PAGES (About, Personal Details): Original behavior
		return {
			scale: 1.2,
			top: '-50%',
			right: '0'
		}
	}

	return (
		<AnimatePresence>
			{onboardingStep !== 'resume' && <motion.video
				autoPlay muted loop playsInline
				ref={ref}
				className={cn('aspect-video absolute -z-10 w-full h-full', className)}
				initial={{scale: 0}}
				animate={getAnimateValues()}
				exit={{scale: 0}}
				transition={{
					type: 'spring',
					duration: 1,
					ease: 'easeInOut'
				}}
				style={{
					objectFit: 'cover'
				}}
			>
				<source src="/letraz-brain.webm" type="video/webm"/>
			</motion.video>}
		</AnimatePresence>
	)
}

export default BrainAnimation
