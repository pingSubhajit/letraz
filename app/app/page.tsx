import NewResumeInput from '@/components/NewResumeInput'
import {Suspense} from 'react'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'
import DashboardSearchContainer from '@/components/dashboard/DashboardSearchContainer'
import ResumeCard from '@/components/dashboard/ResumeCard'
import {auth} from '@clerk/nextjs/server'
import {listResumesForUser} from '@/lib/resume/actions'
import LetrazBrainImage from '@/public/brain.webp'
import Image from 'next/image'

const AppHome = async () => {
	const {userId} = await auth()
	const resumes = await listResumesForUser()
	const baseResume = resumes?.find(r => r.base)

	return (
		<div className="p-8 relative">
			<Image
				src={LetrazBrainImage}
				alt="" aria-hidden
				className="absolute left-1/2 -translate-x-1/2 -top-[900px] blur-xl -z-20"
			/>

			<Suspense fallback={null}>
				<OnboardingWelcome />
			</Suspense>


			{/* MAIN HEADER SECTION */}
			<div className="mt-32 flex flex-col justify-center items-center mb-20">
				<h1 className="text-4xl mb-6 font-medium">Put in a job URL to get started</h1>
				<p className="max-w-2xl text-center opacity-60">Paste in a job posting URL or the full-page content in the input below. We'll do all the heavy lifting and create the perfect resume for you.</p>
			</div>

			{/* Top row with centered Input box and Base Resume */}
			<div className="flex justify-center gap-8 mb-20">
				<NewResumeInput className="rounded-lg h-96 w-72" />
				{baseResume && (
					<ResumeCard resume={baseResume} className="w-72" />
				)}
			</div>

			{/* Search and Resume Grid Container - Only show if user has resumes apart from base */}
			{resumes && resumes.filter(r => !r.base).length > 0 && (
				<DashboardSearchContainer userId={userId || undefined} />
			)}
		</div>
	)
}

export default AppHome
