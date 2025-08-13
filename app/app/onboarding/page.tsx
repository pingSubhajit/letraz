import BrainAnimation from '@/app/app/onboarding/BrainAnimation.client'
import Welcome from '@/components/onboarding/Welcome'
import {notFound} from 'next/navigation'
import {OnboardingStep} from '@/app/app/onboarding/types'
import About from '@/components/onboarding/About'
import PersonalDetails from '@/components/onboarding/PersonalDetails'
import Education from '@/components/onboarding/Education'
import {JSX} from 'react'
import Experience from '@/components/onboarding/Experience'
import BaseResume from '@/components/onboarding/BaseResume'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {educationOptions} from '@/lib/education/queries'
import {experienceQueryOptions} from '@/lib/experience/queries'

/**
 * OnboardingPage component handles the rendering of different onboarding steps.
 *
 * @param {Object} props - The properties object.
 * @param {Promise<Object.<string, string|string[]|undefined>>} props.searchParams - The search parameters.
 * @returns {Promise<JSX.Element>} The JSX code to render the onboarding page.
 */
const OnboardingPage = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<JSX.Element> => {
	// Await the search parameters from the props
	const searchParams = await props.searchParams

	// Extract the step parameter and cast it to OnboardingStep type
	const step = searchParams.step as OnboardingStep | undefined

	// If no step is provided, return a 404 not found response
	if (!step) {
		return notFound()
	}

	const queryClient = new QueryClient()

	//  Pre-fetch the educations and experiences from the database in parallel
	await Promise.all([
		queryClient.prefetchQuery(educationOptions),
		queryClient.prefetchQuery(experienceQueryOptions)
	])

	const dehydratedState = dehydrate(queryClient)


	// Render the appropriate component based on the current onboarding step
	return (
		<HydrationBoundary state={dehydratedState}>
			<div className="h-full min-h-dvh w-full relative">
				<BrainAnimation onboardingStep={step} />

				{step === OnboardingStep.WELCOME && <Welcome />}
				{step === OnboardingStep.ABOUT && <About />}
				{step === OnboardingStep.PERSONAL_DETAILS && <PersonalDetails />}
				{step === OnboardingStep.EDUCATION && <Education />}
				{step === OnboardingStep.EXPERIENCE && <Experience />}
				{step === OnboardingStep.RESUME && <BaseResume />}
			</div>
		</HydrationBoundary>
	)
}

export default OnboardingPage
