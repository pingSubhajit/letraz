'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {cn} from '@/lib/utils'
import {OnboardingStep} from '@/app/app/onboarding/types'

const BrainAnimation = ({className, onboardingStep}: {className?: string, onboardingStep: OnboardingStep}) => {
	return (
		<AnimatePresence>
			<motion.video
				autoPlay muted loop
				className={cn('aspect-video absolute -z-10 w-full h-full scale-150', className)}
				initial={{scale: 0}} animate={{
					scale: onboardingStep === OnboardingStep.WELCOME || onboardingStep === OnboardingStep.EDUCATION || onboardingStep === OnboardingStep.EXPERIENCE ? 1 : 1.2,
					top: onboardingStep === OnboardingStep.WELCOME || onboardingStep === OnboardingStep.EDUCATION || onboardingStep === OnboardingStep.EXPERIENCE ? '0' : '-50%',
					right: onboardingStep === OnboardingStep.EDUCATION || onboardingStep === OnboardingStep.EXPERIENCE ? '-25%' : '0',
				}} exit={{scale: 0}}
				transition={{
					type: 'spring',
					duration: 1,
					ease: 'easeInOut',
				}}
			>
				<source src="/letraz-brain.webm" type="video/webm"/>
			</motion.video>
		</AnimatePresence>
	)
}

export default BrainAnimation
