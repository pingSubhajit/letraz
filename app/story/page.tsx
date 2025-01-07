import LandingPageLogo from '@/app/page.logo'
import {Metadata} from 'next'
import LetrazStoryPageHeading from '@/app/story/page.heading'
import LetrazStoryPageContent from '@/app/story/page.content'

export const metadata: Metadata = {
	title: 'The Letraz Way — Motivation & Manifesto',
	description: 'Create tailored resumes for every job application effortlessly with Letraz. Our AI-powered tool ' +
		'helps you stand out by automatically optimizing your resume for ATS and recruiters, ensuring your skills ' +
		'and experience match the job\'s requirements. No more generic resumes—Letraz makes every application count.',
	openGraph: {
		title: 'Development updates — Letraz',
		description: 'Letraz automates resume creation to match every job\'s requirements, giving job seekers a ' +
			'higher chance of being noticed by ATS and recruiters. Customize your resume with ease!'
	}
}

const LetrazStoryPage = async () => {
	return (
		<div className="min-h-screen py-16 lg:py-36 px-8 relative">
			{/* TOP GRADIENT ACCEnT */}
			<div className="fixed inset-x-0 top-0 pointer-events-none">
				<div className="bg-flame-500 w-full absolute inset-x-0 top-0 h-1 z-20"/>

				<div className="w-[200px] lg:w-[700px] h-[48px] lg:h-[118px] absolute bg-rose-500/70 rounded-[50%] z-20 -top-20 right-16 blur-[150px]"/>
				<div className="w-[200px] lg:w-[700px] h-[68px] lg:h-[228px] absolute bg-flame-500/70 rounded-[50%] z-20 -top-64 left-16 blur-[150px]"/>
				<div className="w-[200px] lg:w-[700px] h-[56px] lg:h-[176px] absolute bg-amber-300/70 rounded-[50%] z-20 -top-48 left-1/2 -translate-x-1/2 blur-[150px]"/>

				<div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-[50px] lg:h-[150px] z-10" />
			</div>

			<div className="max-w-[650px] 2xl:max-w-[720px] mx-auto font-bold flex flex-col items-center">
				<LandingPageLogo className="w-24 md:w-28 lg:w-32 xl:w-36 mb-4"/>
				<LetrazStoryPageHeading />
				<LetrazStoryPageContent className="mt-28 2xl:mt-36" />
			</div>
		</div>
	)
}

export default LetrazStoryPage
