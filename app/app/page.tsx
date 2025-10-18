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
		<div className="p-6 lg:p-8 relative overflow-x-hidden">
			<Image
				src={LetrazBrainImage}
				alt="" aria-hidden
				className="absolute left-1/2 -translate-x-1/2 -top-[300px] sm:-top-[500px] md:-top-[700px] lg:-top-[900px] blur-xl -z-20"
			/>

			<Suspense fallback={null}>
				<OnboardingWelcome />
			</Suspense>


			{/* MAIN HEADER SECTION */}
			<div className="mt-20 sm:mt-28 lg:mt-32 flex flex-col justify-center items-center mb-16 lg:mb-20">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl mb-4 lg:mb-6 font-medium">Put in a job URL to get started</h1>
				<p className="max-w-2xl text-center opacity-60 text-sm lg:text-base px-4 lg:px-0">Paste in a job posting URL or the full-page content in the input below. We'll do all the heavy lifting and create the perfect resume for you.</p>
			</div>

			{/* Top row with centered Input box and Base Resume */}
			<div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-8 mb-16 lg:mb-20">
				<NewResumeInput className="rounded-lg h-80 md:h-96 w-full max-w-sm lg:w-72" />
				<BaseResumeCard className="w-full max-w-sm lg:w-72" />
			</div>

			{/* Search and Resume Grid Container */}
			<DashboardResumesGrid />
		</div>
	)
}

export default AppHome
