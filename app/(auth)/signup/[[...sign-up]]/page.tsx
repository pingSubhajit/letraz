import SignUpContent from '@/app/(auth)/signup/[[...sign-up]]/SignUp.content'
import {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Sign up for Letraz — Your Personalized Resume Builder',
	description: 'Create your Letraz account to start building personalized resumes that match job descriptions. ' +
		'Join thousands of job seekers who are landing their dream jobs with tailored resumes.',
	openGraph: {
		title: 'Sign up for Letraz | Start Building Personalized Resumes',
		description: 'Create your Letraz account and start building resumes tailored to each job application. ' +
			'Join the community of successful job seekers.'
	}
}

const SignUpPage = () => {
	return <SignUpContent />
}

export default SignUpPage
