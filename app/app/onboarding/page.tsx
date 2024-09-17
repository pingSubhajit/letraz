import BrainAnimation from '@/app/app/onboarding/BrainAnimation.client'
import Welcome from '@/components/onboarding/Welcome'
import {notFound} from 'next/navigation'

export enum OnboardingStep {
	WELCOME = 'welcome',
	ABOUT = 'about',
}

const OnboardingPage = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
	const step = searchParams.step as OnboardingStep | undefined

	if (!step) {
		return notFound()
	}

	return (
		<div className="h-full w-full relative">
			<BrainAnimation onboardingStep={step} />

			{step === OnboardingStep.WELCOME && <Welcome />}
		</div>
	)
}

export default OnboardingPage
