'use client'

import {useUser} from '@clerk/nextjs'
import {OnboardingMetadata, OnboardingStep} from '@/lib/onboarding/types'
import {ONBOARDING_STEPS} from '@/app/app/onboarding/types'

/**
 * Hook to get the current onboarding state from the user's metadata
 */
export const useOnboardingState = () => {
	const {user} = useUser()

	const metadata = user?.publicMetadata as OnboardingMetadata

	return {
		onboardingComplete: metadata?.onboardingComplete ?? false,
		currentStep: metadata?.currentOnboardingStep ?? 'welcome',
		completedSteps: metadata?.completedSteps ?? [],
		isLoading: !user
	}
}

/**
 * Hook to check if onboarding is complete
 */
export const useOnboardingComplete = () => {
	const {onboardingComplete} = useOnboardingState()
	return onboardingComplete
}

/**
 * Hook to get the current onboarding step
 */
export const useCurrentOnboardingStep = () => {
	const {currentStep} = useOnboardingState()
	return currentStep
}

/**
 * Hook to check if a specific step is completed
 */
export const useIsStepCompleted = (step: OnboardingStep) => {
	const {completedSteps} = useOnboardingState()
	return completedSteps.includes(step)
}

/**
 * Hook to get onboarding progress percentage
 */
export const useOnboardingProgress = () => {
	const {completedSteps} = useOnboardingState()
	const totalSteps = ONBOARDING_STEPS.length // welcome, about, personal-details, education, experience, resume
	const completedCount = completedSteps.length

	return Math.round((completedCount / totalSteps) * 100)
}
