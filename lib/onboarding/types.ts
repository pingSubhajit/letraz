import {z} from 'zod'

// Define the available onboarding steps
export const OnboardingStepSchema = z.enum([
	'welcome',
	'about',
	'personal-details',
	'education',
	'experience',
	'resume'
])

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>

// Schema for onboarding metadata
export const OnboardingMetadataSchema = z.object({
	onboardingComplete: z.boolean().optional(),
	currentOnboardingStep: OnboardingStepSchema.optional(),
	completedSteps: z.array(OnboardingStepSchema).optional()
})

export type OnboardingMetadata = z.infer<typeof OnboardingMetadataSchema>

// Step progression mapping
export const ONBOARDING_STEPS: OnboardingStep[] = [
	'welcome',
	'about',
	'personal-details',
	'education',
	'experience',
	'resume'
]

// Helper to get next step
export const getNextStep = (currentStep: OnboardingStep): OnboardingStep | null => {
	const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)
	const nextIndex = currentIndex + 1
	return nextIndex < ONBOARDING_STEPS.length ? ONBOARDING_STEPS[nextIndex] : null
}

// Helper to get previous step
export const getPreviousStep = (currentStep: OnboardingStep): OnboardingStep | null => {
	const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)
	const previousIndex = currentIndex - 1
	return previousIndex >= 0 ? ONBOARDING_STEPS[previousIndex] : null
}
