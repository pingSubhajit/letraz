'use client'

import {useEffect} from 'react'
import {updateOnboardingStep} from '@/lib/onboarding/actions'

interface BaseResumeProviderProps {
	children: React.ReactNode
}

const BaseResumeProvider = ({children}: BaseResumeProviderProps) => {
	useEffect(() => {
		// Update onboarding step when component mounts
		updateOnboardingStep('resume')
	}, [])

	return <>{children}</>
}

export default BaseResumeProvider
