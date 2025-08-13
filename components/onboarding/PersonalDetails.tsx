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
				<div className="mt-72">
					<TextAnimate
						text="Let’s get to know you better"
						type="calmInUp"
						className="text-5xl leading-snug flex justify-center" />
				</div>

				<OnboardingFlowControl />
			</div>
		</HydrationBoundary>
	)
}

export default PersonalDetails
