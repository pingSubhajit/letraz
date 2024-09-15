import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import SignInPageTitle from '@/app/(auth)/signin/[[...sign-in]]/SignInPage.title'
import {AnimatePresence} from 'framer-motion'
import GithubSignInButton from '@/components/auth/GithubSignInButton'
import {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Login to Letraz — Your Personalized Resume Builder',
	description: 'Log in to Letraz to create, customize, and manage your job-specific resumes effortlessly. ' +
		'Tailor each resume to the job description with ease and improve your chances of landing the perfect job.',
	openGraph: {
		title: 'Login to Letraz | Access Your Personalized Resume Builder',
		description: 'Log in to Letraz and continue building or customizing resumes tailored to each job ' +
			'application. Improve your job search with tailored resumes.',
	}
}

const SignInPage = () => {
	return (
		<div className="h-screen overflow-hidden flex justify-end items-center">
			<video autoPlay muted loop className="aspect-video absolute -z-10 w-full h-full">
				<source src="/letraz-brain.webm" type="video/webm"/>
			</video>
			<div className="w-[50vw] h-screen bg-neutral-50 flex flex-col justify-center items-center">
				<AnimatePresence>
					<SignInPageTitle/>
				</AnimatePresence>

				<GoogleSignInButton className="mt-16"/>
				<GithubSignInButton className="mt-6" />
			</div>
		</div>
	)
}

export default SignInPage
