import {Metadata} from 'next'
import Waitlist from '@/components/Waitlist'
import LandingPageHeading from '@/app/page.heading'

export const metadata: Metadata = {
	title: 'Letraz — Craft unique resumes for each job application effortlessly',
	description: 'Create tailored resumes for every job application effortlessly with Letraz. Our AI-powered tool ' +
		'helps you stand out by automatically optimizing your resume for ATS and recruiters, ensuring your skills ' +
		'and experience match the job\'s requirements. No more generic resumes—Letraz makes every application count.',
	openGraph: {
		title: 'Letraz — Effortless, Tailored Resumes for Every Job Application',
		description: 'Letraz automates resume creation to match every job\'s requirements, giving job seekers a ' +
			'higher chance of being noticed by ATS and recruiters. Customize your resume with ease!',
	}
}

const LandingPage = () => {
	return (
		<main className="h-svh overflow-hidden flex justify-center items-center bg-white">
			<video autoPlay muted className="aspect-video h-full scale-[3] lg:scale-100">
				<source src="/letraz-intro.mp4" type="video/mp4"/>
				Your browser does not support the video tag. You can <a href="/letraz-intro.mp4">download the video</a> instead.
			</video>

			<div className="absolute bottom-8 lg:bottom-auto lg:top-24 z-10 flex flex-col justify-center items-center gap-8 md:gap-12 lg:gap-16">
				<LandingPageHeading />
				<Waitlist />
			</div>
		</main>
	)
}

export default LandingPage
