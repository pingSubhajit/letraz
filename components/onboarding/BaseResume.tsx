import {QueryClient} from '@tanstack/react-query'

import ResumeView from '@/components/resume/ResumeView'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import OnboardingCompletionButton from '@/components/onboarding/OnboardingCompletionButton'

const BaseResume = async () => {

	const queryClient = new QueryClient()

	// prefetch base resume data
	await queryClient.prefetchQuery(baseResumeQueryOptions)

	return (
		<div className="w-full h-full flex flex-col justify-start">
			<ResumeView />
			<OnboardingCompletionButton />
		</div>
	)
}

export default BaseResume
