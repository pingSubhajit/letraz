'use client'

import {useEffect} from 'react'
import {useSearchParams} from 'next/navigation'
import {toast} from 'sonner'

const OnboardingWelcome = () => {
	const searchParams = useSearchParams()
	const fromOnboarding = searchParams.get('from')

	useEffect(() => {
		if (fromOnboarding === 'onboarding') {
			// Show welcome toast after a brief delay
			const timer = setTimeout(() => {
				toast.success('Welcome to your Dashboard!', {
					description: 'You\'ve successfully completed the onboarding process. Let\'s start building your resume!',
					duration: 4000
				})
			}, 500)

			return () => clearTimeout(timer)
		}
	}, [fromOnboarding])

	return null
}

export default OnboardingWelcome
