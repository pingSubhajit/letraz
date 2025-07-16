import {OnboardingStep as OnboardingStepType} from '@/lib/onboarding/types'

// Export the type for TypeScript usage
export type OnboardingStep = OnboardingStepType

export const OnboardingStep = {
	WELCOME: 'welcome' as const,
	ABOUT: 'about' as const,
	PERSONAL_DETAILS: 'personal-details' as const,
	EDUCATION: 'education' as const,
	EXPERIENCE: 'experience' as const,
	RESUME: 'resume' as const
} as const

