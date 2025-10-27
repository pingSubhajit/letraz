import {AuthenticateWithRedirectCallback} from '@clerk/nextjs'
import type {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Signing you in…',
	description: 'Completing your sign-in. You will be redirected shortly.',
	robots: 'noindex, nofollow'
}

const SSOCallback = () => {
	return <AuthenticateWithRedirectCallback />
}

export default SSOCallback
