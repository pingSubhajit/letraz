import SignUpContent from '@/app/(auth)/signup/[[...sign-up]]/SignUp.content'
import {Metadata} from 'next'
import {cookies} from 'next/headers'

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

type SignUpSearchParams = {
    integrate?: string
    authMethod?: string
    userId?: string
}

const SignUpPage = async (
    props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) => {
	const cookieStore = await cookies()
	const searchParamsObj = await props.searchParams as SignUpSearchParams
	const integrate = searchParamsObj?.integrate as string | undefined
	const authMethod = String(searchParamsObj?.authMethod || '').toLowerCase()
	const rizeUserId = searchParamsObj?.userId as string | undefined
	const isRizeFlow = integrate === 'rize'

	let preselectedProvider: 'google' | 'github' | undefined
	if (authMethod === 'google') preselectedProvider = 'google'
	if (authMethod === 'github') preselectedProvider = 'github'

	if (integrate === 'rize' && rizeUserId) {
		try {
			const value = JSON.stringify({integrate, authMethod, userId: rizeUserId})
			cookieStore.set('rize_ctx', value, {
				httpOnly: true,
				sameSite: 'lax',
				secure: true,
				path: '/',
				maxAge: 60 * 10 // 10 minutes
			})
		} catch {}
	}

	return <SignUpContent preselectedProvider={preselectedProvider} isRizeFlow={isRizeFlow} />
}

export default SignUpPage
