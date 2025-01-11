import {getPosts} from '@/lib/posts.method'
import PostsList from '@/app/(website)/changes/PostsList'
import LandingPageLogo from '@/app/(website)/page.logo'
import {Metadata} from 'next'
import ChangesPageHeading from '@/app/(website)/changes/page.heading'

export const metadata: Metadata = {
	title: 'Development updates — Letraz',
	description: 'Create tailored resumes for every job application effortlessly with Letraz. Our AI-powered tool ' +
		'helps you stand out by automatically optimizing your resume for ATS and recruiters, ensuring your skills ' +
		'and experience match the job\'s requirements. No more generic resumes—Letraz makes every application count.',
	openGraph: {
		title: 'Development updates — Letraz',
		description: 'Letraz automates resume creation to match every job\'s requirements, giving job seekers a ' +
			'higher chance of being noticed by ATS and recruiters. Customize your resume with ease!'
	}
}

const ChangelogPage = async () => {
	const posts = await getPosts()

	return (
		<div className="min-h-screen py-16 lg:py-32 px-8 relative">
			<div className="max-w-[720px] mx-auto font-bold">
				<LandingPageLogo className="w-24 md:w-28 lg:w-32 xl:w-36" hideOnMobile={true} />
				<ChangesPageHeading />
				<PostsList posts={posts.posts} className="mt-20" />
			</div>
		</div>
	)
}

export default ChangelogPage
