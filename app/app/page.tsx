import NewResumeInput from '@/components/NewResumeInput'
import {Suspense} from 'react'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'
import DashboardSearchContainer from '@/components/dashboard/DashboardSearchContainer'
import ResumeCard from '@/components/dashboard/ResumeCard'
import {auth} from '@clerk/nextjs/server'
import {listResumesForUser} from '@/lib/resume/actions'

const AppHome = async () => {
	const {userId} = await auth()
	const resumes = await listResumesForUser()
	const baseResume = resumes?.find(r => r.base)

	return (
		<div className="p-8">
			<Suspense fallback={null}>
				<OnboardingWelcome />
			</Suspense>


			{/* Top row with centered Input box and Base Resume */}
			<div className="flex justify-center gap-8 mb-8">
				<NewResumeInput className="rounded-lg h-96 w-72" />
				{baseResume && (
					<ResumeCard resume={baseResume} className="w-72" />
				)}
			</div>

			{/* Search and Resume Grid Container */}
			<DashboardSearchContainer userId={userId || undefined} />
		</div>
	)
}

export default AppHome
