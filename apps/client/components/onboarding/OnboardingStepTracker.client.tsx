'use client'

import {useEffect} from 'react'
import {useAnalytics} from '@/lib/analytics'

const OnboardingStepTracker = ({step}: {step: string}) => {
	const {track} = useAnalytics()
	useEffect(() => {
		track('onboarding_step_viewed', {step})
	}, [step])
	return null
}

export default OnboardingStepTracker


