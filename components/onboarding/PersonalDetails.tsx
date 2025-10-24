import TextAnimate from '@/components/animations/TextAnimations'
import {dehydrate, HydrationBoundary, QueryClient} from '@tanstack/react-query'
import {userInfoQueryOptions} from '@/lib/user-info/queries'
import OnboardingFlowControl from '@/components/onboarding/OnboardingFlowControl'

const PersonalDetails = async () => {

	const queryClient = new QueryClient()
	await queryClient.prefetchQuery(userInfoQueryOptions)
	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<div className="w-full h-full flex flex-col">
				{/* HEADING TEXT */}
				<div className="mt-16 sm:mt-32 lg:mt-72 px-4 max-w-6xl mx-auto">
					<TextAnimate
						text="Let's get to know you better"
						type="rollIn"
						className="text-4xl sm:text-5xl leading-relaxed flex flex-wrap justify-center text-center pb-2" />
				</div>

				<OnboardingFlowControl />
			</div>
		</HydrationBoundary>
	)
}

export default PersonalDetails
