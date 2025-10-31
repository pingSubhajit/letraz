'use client'

import BrainAnimation from '@/app/app/onboarding/BrainAnimation.client'
import {OnboardingStep} from '@/app/app/onboarding/types'
import ErrorView from '@/components/utilities/ErrorView'

const OnboardingError = () => {
	return (
		<div>
			<BrainAnimation onboardingStep={OnboardingStep.WELCOME} className="saturate-[3] hue-rotate-[340deg] object-cover" />
			<ErrorView />
		</div>
	)
}

export default OnboardingError
