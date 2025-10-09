import type {Metadata} from 'next'
import NewResumeInput from '@/components/NewResumeInput'
import {Suspense} from 'react'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'
import BaseResumeCard from '@/components/dashboard/BaseResumeCard'
import DashboardResumesGrid from '@/components/dashboard/DashboardResumesGrid'
import LetrazBrainImage from '@/public/brain.webp'
import Image from 'next/image'

export const metadata: Metadata = {
	title: 'Dashboard',
	description: 'Start crafting tailored resumes, manage drafts, and track your progress.'
}

const AppHome = () => {
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
				<BaseResumeCard className="w-72" />
			</div>

			{/* Search and Resume Grid Container */}
			<DashboardResumesGrid />
		</div>
	)
}

export default AppHome
