'use client'

import {useSignIn} from '@clerk/nextjs'
import {OAuthStrategy} from '@clerk/types'
import {FcGoogle} from 'react-icons/fc'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'

const GoogleAuthButton = ({className}: {className?: string}) => {
	const {signIn} = useSignIn()

	if (!signIn) return null

	const signInWith = (strategy: OAuthStrategy) => {
		return signIn.authenticateWithRedirect({
			strategy,
			redirectUrl: '/sso-callback',
			redirectUrlComplete: '/app'
		})
	}

	return (
		<motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="w-full">
			<Button variant="outline" onClick={() => signInWith('oauth_google')} className={cn('text-base py-6 px-20', className)}>
				<FcGoogle className="h-6 w-6 mr-2" />
				Continue with Google
			</Button>
		</motion.div>
	)
}

export default GoogleAuthButton
