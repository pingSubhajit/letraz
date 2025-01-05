'use client'

import {useSignIn} from '@clerk/nextjs'
import {OAuthStrategy} from '@clerk/types'
import {BsGithub} from 'react-icons/bs'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'

const GithubSignInButton = ({className}: {className?: string}) => {
	const {signIn} = useSignIn()

	if (!signIn) return null

	const signInWith = (strategy: OAuthStrategy) => {
		return signIn.authenticateWithRedirect({
			strategy,
			redirectUrl: '/signup/sso-callback',
			redirectUrlComplete: '/app'
		})
	}

	return (
		<motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
			<Button onClick={() => signInWith('oauth_github')} className={cn('relative rounded-full bg-neutral-50 shadow-2xl text-neutral-950 hover:bg-neutral-100 text-base py-6 px-20 z-10', className)}>
				<BsGithub className="h-6 w-6 mr-2 fill-neutral-950" />
				Sign in with Github
			</Button>
		</motion.div>
	)
}

export default GithubSignInButton
