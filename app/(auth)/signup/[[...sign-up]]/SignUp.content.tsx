'use client'

import {useMemo, useState} from 'react'
import SignUpPageTitle from '@/app/(auth)/signup/[[...sign-up]]/SignUpPage.title'
import EmailPasswordSignUpForm from '@/components/auth/EmailPasswordSignUpForm'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import GithubAuthButton from '@/components/auth/GithubAuthButton'

const SignUpContent = ({preselectedProvider}: { preselectedProvider?: 'google' | 'github' }) => {
	const [isVerificationMode, setIsVerificationMode] = useState(false)
    const isRizeFlow = useMemo(() => {
        try {
            const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
            return params.get('integrate') === 'rize'
        } catch { return false }
    }, [])

	return (
		<>
			<SignUpPageTitle isVerification={isVerificationMode} isRizeFlow={isRizeFlow} />

			<div className="flex flex-col justify-center items-center mt-8 gap-6 w-full">
				{/* Email/Password Sign Up Form */}
				<EmailPasswordSignUpForm
					className="w-full"
					onVerificationStateChange={setIsVerificationMode}
				/>

				{/* Show OAuth options only when not in verification mode */}
				{!isVerificationMode && (
					<>
						{/* Divider */}
						<div className="flex items-center w-full">
							<div className="flex-grow h-px bg-neutral-300"></div>
							<span className="px-4 text-sm text-neutral-500 font-medium">or continue with</span>
							<div className="flex-grow h-px bg-neutral-300"></div>
						</div>

					{/* OAuth Providers */}
						<div className="flex flex-col gap-4 w-full">
						<GoogleAuthButton className="w-full" highlighted={preselectedProvider === 'google'} />
						<GithubAuthButton className="w-full" highlighted={preselectedProvider === 'github'} />
						</div>
					</>
				)}
			</div>
		</>
	)
}

export default SignUpContent
