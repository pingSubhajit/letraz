import NewResumeInput from '@/components/NewResumeInput'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'
import {Suspense} from 'react'
import DashboardResumeGrid from '@/components/dashboard/DashboardResumeGrid'

const AppHome = () => {
	return (
		<div className="p-8">
			<Suspense fallback={null}>
				<OnboardingWelcome />
			</Suspense>

			<h1>Dashboard</h1>
			<p>Welcome to the dashboard page!</p>

			<div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
				<NewResumeInput className="rounded-lg" />
				<DashboardResumeGrid />
			</div>
		</div>
	)
}

export default AppHome
