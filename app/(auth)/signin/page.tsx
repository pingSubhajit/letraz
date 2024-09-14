import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import SignInPageTitle from '@/app/(auth)/signin/SignInPage.title'
import {AnimatePresence} from 'framer-motion'
import GithubSignInButton from '@/components/auth/GithubSignInButton'

const SignInPage = () => {
	return (
		<div className="h-screen overflow-hidden flex justify-end items-center">
			<video autoPlay muted loop className="aspect-video absolute -z-10 w-full h-full">
				<source src="/letraz-brain.webm" type="video/webm"/>
			</video>
			<div className="w-[50vw] h-screen bg-neutral-50 flex flex-col justify-center items-center">
				<AnimatePresence>
					<SignInPageTitle />
				</AnimatePresence>

				<GoogleSignInButton className="mt-16" />
				<GithubSignInButton className="mt-6" />
			</div>
		</div>
	)
}

export default SignInPage
