import {AuthenticateWithRedirectCallback} from '@clerk/nextjs'
import type {Metadata} from 'next'
import {Loader2} from 'lucide-react'

export const metadata: Metadata = {
	title: 'Signing you in…',
	description: 'Completing your sign-in. You will be redirected shortly.',
	robots: 'noindex, nofollow'
}

const SSOCallback = () => {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
			<AuthenticateWithRedirectCallback />
			<div>
				<div className="flex items-center gap-3 text-2xl font-medium" role="status">
					<Loader2 className="animate-spin size-6" />
					<span>Signing you in . . .</span>
				</div>
				<p className="mt-2 opacity-60 pl-9 text-left">We are getting a few things in order before you arrive</p>
			</div>
		</div>
	)
}

export default SSOCallback
