import LandingPageLogo from '@/app/(website)/page.logo'
import {Metadata} from 'next'
import LetrazStoryPageHeading from '@/app/(website)/story/page.heading'
import LetrazStoryPageContent from '@/app/(website)/story/page.content'

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
			<div className="max-w-[650px] 2xl:max-w-[720px] mx-auto font-bold flex flex-col items-center">
				<LandingPageLogo className="w-24 md:w-28 lg:w-32 xl:w-36 mb-4" hideOnMobile={true} />
				<LetrazStoryPageHeading />
				<LetrazStoryPageContent className="mt-28 2xl:mt-36" />
			</div>
		</div>
	)
}

export default LetrazStoryPage
