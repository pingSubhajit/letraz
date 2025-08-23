import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import SignInPageTitle from '@/app/(auth)/signin/[[...sign-in]]/SignInPage.title'
import GithubAuthButton from '@/components/auth/GithubAuthButton'
import EmailPasswordSignInForm from '@/components/auth/EmailPasswordSignInForm'
import {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Login to Letraz — Your Personalized Resume Builder',
	description: 'Log in to Letraz to create, customize, and manage your job-specific resumes effortlessly. ' +
		'Tailor each resume to the job description with ease and improve your chances of landing the perfect job.',
	openGraph: {
		title: 'Login to Letraz | Access Your Personalized Resume Builder',
		description: 'Log in to Letraz and continue building or customizing resumes tailored to each job ' +
			'application. Improve your job search with tailored resumes.'
	}
}

const SignInPage = () => {
	return (
		<>
			<SignInPageTitle />

			<div className="flex flex-col justify-center items-center mt-8 gap-6 w-full">
				{/* Email/Password Sign In Form */}
				<EmailPasswordSignInForm className="w-full" />

				{/* Divider */}
				<div className="flex items-center w-full">
					<div className="flex-grow h-px bg-neutral-300"></div>
					<span className="px-4 text-sm text-neutral-500 font-medium">or continue with</span>
					<div className="flex-grow h-px bg-neutral-300"></div>
				</div>

				{/* OAuth Providers */}
				<div className="flex flex-col gap-4 w-full">
					<GoogleAuthButton className="w-full" />
					<GithubAuthButton className="w-full" />
				</div>
			</div>
		</>
	)
}

export default SignInPage
