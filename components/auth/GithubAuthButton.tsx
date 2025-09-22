'use client'

import {useSignIn} from '@clerk/nextjs'
import {OAuthStrategy} from '@clerk/types'
import {BsGithub} from 'react-icons/bs'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'
import CornerRibbon from '@/components/ui/CornerRibbon'

const GithubAuthButton = ({className, highlighted}: { className?: string, highlighted?: boolean }) => {
	const {signIn} = useSignIn()

	if (!signIn) return null

	const signInWith = (strategy: OAuthStrategy) => {
		return signIn.authenticateWithRedirect({
			strategy,
			redirectUrl: '/sso-callback',
			redirectUrlComplete: `${window.location.origin}/app`
		})
	}

	return (
		<motion.div initial={{opacity: 0}} animate={{opacity: 1}} className={cn('w-full relative', highlighted ? '' : '')}>
			{highlighted && <CornerRibbon />}
			<Button
				variant={'outline'}
				onClick={() => signInWith('oauth_github')}
				className={cn('text-base py-6 px-20 z-10 transition-opacity', highlighted ? '' : 'opacity-90 hover:opacity-100', className)}
			>
				<BsGithub className="h-6 w-6 mr-2 fill-neutral-950" />
				Continue with Github
			</Button>
		</motion.div>
	)
}

export default GithubAuthButton
