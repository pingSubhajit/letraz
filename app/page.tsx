import {Metadata} from 'next'
import Waitlist from '@/components/Waitlist'
import LandingPageHeading from '@/app/page.heading'
import LandingPageLogo from '@/app/page.logo'
import LandingPageDescription from '@/app/page.description'

export const metadata: Metadata = {
	title: 'Letraz — Craft unique resumes for each job application effortlessly',
	description: 'Create tailored resumes for every job application effortlessly with Letraz. Our AI-powered tool ' +
		'helps you stand out by automatically optimizing your resume for ATS and recruiters, ensuring your skills ' +
		'and experience match the job\'s requirements. No more generic resumes—Letraz makes every application count.',
	openGraph: {
		title: 'Letraz — Effortless, Tailored Resumes for Every Job Application',
		description: 'Letraz automates resume creation to match every job\'s requirements, giving job seekers a ' +
			'higher chance of being noticed by ATS and recruiters. Customize your resume with ease!'
	}
}

const LandingPage = ({searchParams}: { searchParams: { [key: string]: string | string[] | undefined } }) => {
	const referrer = searchParams.ref as string | undefined

	return (
		<main className="h-svh overflow-hidden flex flex-col lg:flex-row justify-stretch lg:justify-center items-stretch bg-white">
			<div className="flex flex-col justify-center items-start gap-8 p-8 lg:p-16 relative">
				<LandingPageLogo className="relative z-30" />
				<LandingPageHeading className="relative z-30" />
				<LandingPageDescription className="lg:py-2 relative z-30" />
				<Waitlist className="relative z-30" referrer={referrer} />

				<div className="absolute w-full h-full inset-0 bg-neutral-100 z-20 shadow-2xl" />

				{/* SIDEBAR GRADIENT SHADOWS */}
				<div className="hidden lg:block h-[674px] w-[118px] absolute bg-rose-500/70 rounded-[50%] blur-[200px] z-10 -top-48 right-16" />
				<div className="hidden lg:block h-[669px] w-[228px] absolute bg-flame-500/70 rounded-[50%] z-10 top-[25%] blur-[200px] right-16" />
				<div className="hidden lg:block h-[709px] w-[176px] absolute bg-amber-300/70 rounded-[50%] z-10 -bottom-36 blur-[200px] right-16" />
			</div>

			<div className="w-full lg:w-[80%] h-full lg:h-auto flex justify-center items-center overflow-hidden">
				<video loop autoPlay muted className="aspect-video h-full scale-150">
					<source src="/letraz-intro.mp4" type="video/mp4"/>
				</video>
			</div>
		</main>
	)
}

export default LandingPage
