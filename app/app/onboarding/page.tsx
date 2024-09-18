import BrainAnimation from '@/app/app/onboarding/BrainAnimation.client'
import Welcome from '@/components/onboarding/Welcome'
import {notFound} from 'next/navigation'
import {OnboardingStep} from '@/app/app/onboarding/types'
import About from '@/components/onboarding/About'
import PersonalDetails from '@/components/onboarding/PersonalDetails'

const OnboardingPage = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
	const step = searchParams.step as OnboardingStep | undefined

	if (!step) {
		return notFound()
	}

	return (
		<div className="h-full w-full relative">
			<BrainAnimation onboardingStep={step} />

			{step === OnboardingStep.WELCOME && <Welcome />}
			{step === OnboardingStep.ABOUT && <About />}
			{step === OnboardingStep.PERSONAL_DETAILS && <PersonalDetails />}
		</div>
	)
}

export default OnboardingPage
