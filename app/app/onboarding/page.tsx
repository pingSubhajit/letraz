import BrainAnimation from '@/app/app/onboarding/BrainAnimation.client'
import Welcome from '@/components/onboarding/Welcome'
import {notFound} from 'next/navigation'
import {OnboardingStep} from '@/app/app/onboarding/types'
import About from '@/components/onboarding/About'
import PersonalDetails from '@/components/onboarding/PersonalDetails'
import {auth} from '@clerk/nextjs/server'

const OnboardingPage = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) => {
	const searchParams = await props.searchParams
	const {userId} = await auth()
	const step = searchParams.step as OnboardingStep | undefined
	/*
	 * const educations = await getEducationsFromDB(userId!)
	 * const experiences = await getExperiencesFromDB(userId!)
	 */

	if (!step) {
		return notFound()
	}

	return (
		<div className="h-full min-h-dvh w-full relative">
			<BrainAnimation onboardingStep={step} />

			{step === OnboardingStep.WELCOME && <Welcome />}
			{step === OnboardingStep.ABOUT && <About />}
			{step === OnboardingStep.PERSONAL_DETAILS && <PersonalDetails />}
			{/* {step === OnboardingStep.EDUCATION && <Education allEducations={educations} />}*/}
			{/* {step === OnboardingStep.EXPERIENCE && <Experience allExperiences={experiences} />}*/}
			{/* {step === OnboardingStep.RESUME && <BaseResume />}*/}
		</div>
	)
}

export default OnboardingPage
