'use server'

import {auth, clerkClient} from '@clerk/nextjs/server'
import {
	getNextStep,
	ONBOARDING_STEPS,
	OnboardingMetadata,
	OnboardingMetadataSchema,
	OnboardingStep
} from '@/lib/onboarding/types'

/**
 * Updates the user's current onboarding step
 */
export const updateOnboardingStep = async (step: OnboardingStep): Promise<OnboardingMetadata> => {
	const {userId} = await auth()

	if (!userId) {
		throw new Error('User not authenticated')
	}

	const client = await clerkClient()
	const user = await client.users.getUser(userId)

	const currentMetadata = OnboardingMetadataSchema.parse(user.publicMetadata || {})
	const completedSteps = currentMetadata.completedSteps || []

	// Add current step to completed steps if not already there
	const updatedCompletedSteps = completedSteps.includes(step)
		? completedSteps
		: [...completedSteps, step]

	const updatedMetadata: OnboardingMetadata = {
		...currentMetadata,
		currentOnboardingStep: step,
		completedSteps: updatedCompletedSteps
	}

	await client.users.updateUser(userId, {
		publicMetadata: updatedMetadata
	})

	return updatedMetadata
}

/**
 * Progresses to the next onboarding step
 */
export const progressToNextStep = async (currentStep: OnboardingStep): Promise<OnboardingMetadata> => {
	const nextStep = getNextStep(currentStep)

	if (!nextStep) {
		// If no next step, complete onboarding
		return completeOnboarding()
	}

	return updateOnboardingStep(nextStep)
}

/**
 * Marks onboarding as complete
 */
export const completeOnboarding = async (): Promise<OnboardingMetadata> => {
	const {userId} = await auth()

	if (!userId) {
		throw new Error('User not authenticated')
	}

	const client = await clerkClient()
	const user = await client.users.getUser(userId)

	const currentMetadata = user.publicMetadata as OnboardingMetadata

	const completedMetadata: OnboardingMetadata = {
		...currentMetadata,
		onboardingComplete: true,
		currentOnboardingStep: 'resume', // Final step
		completedSteps: ONBOARDING_STEPS // Mark all steps as completed
	}

	await client.users.updateUser(userId, {
		publicMetadata: completedMetadata
	})

	return completedMetadata
}

/**
 * Gets the current onboarding state for the user
 */
export const getOnboardingState = async (): Promise<OnboardingMetadata> => {
	const {userId} = await auth()

	if (!userId) {
		throw new Error('User not authenticated')
	}

	const client = await clerkClient()
	const user = await client.users.getUser(userId)

	return user.publicMetadata as OnboardingMetadata
}

/**
 * Resets onboarding state (useful for testing)
 */
export const resetOnboarding = async (): Promise<void> => {
	const {userId} = await auth()

	if (!userId) {
		throw new Error('User not authenticated')
	}

	const client = await clerkClient()

	await client.users.updateUser(userId, {
		publicMetadata: {
			onboardingComplete: false,
			currentOnboardingStep: 'welcome',
			completedSteps: []
		}
	})
}
