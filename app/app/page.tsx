import NewResumeInput from '@/components/NewResumeInput'
import ResumeSearchBar from '@/components/resume/ResumeSearchBar'
import {Suspense} from 'react'
import DashboardResumeGrid from '@/components/dashboard/DashboardResumeGrid'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'

const AppHome = () => {
	return (
		<div className="p-8">
            <Suspense fallback={null}>
                <OnboardingWelcome />
            </Suspense>

            <div className="flex items-center gap-6">
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <div className="flex-1 max-w-3xl">
                    <ResumeSearchBar />
                </div>
            </div>

			<div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
				<NewResumeInput className="rounded-lg" />
				<DashboardResumeGrid />
			</div>
		</div>
	)
}

export default AppHome
