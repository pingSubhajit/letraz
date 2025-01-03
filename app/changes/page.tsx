import {getPosts} from '@/lib/posts.method'
import PostsList from '@/app/changes/PostsList'
import {discordHandle} from '@/constants'
import LandingPageLogo from '@/app/page.logo'
import {Metadata} from 'next'

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
		<div className="min-h-screen py-16 lg:py-32 px-8">
			<div className="max-w-[720px] mx-auto font-bold">
				<LandingPageLogo className="w-24 md:w-28 lg:w-32 xl:w-36" />
				<h1 className="mt-6 text-3xl lg:text-4xl xl:text-5xl leading-snug tracking-tight">News & updates about the development</h1>
				<h2 className="mt-4 text-base lg::text-lg opacity-70 max-w-[75%]">Join our <a href={discordHandle} target="_blank" className="font-semibold text-flame-500 focus-visible:underline hover:underline">Discord</a> to stay connected to more frequent updates and help us build the community</h2>
				<PostsList posts={posts.posts} className="mt-20" />
			</div>
		</div>
	)
}

export default ChangelogPage
