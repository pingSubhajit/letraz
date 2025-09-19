'use client'

import {Button} from '@/components/ui/button'
import {ChevronRight} from 'lucide-react'
import {useTransitionRouter} from 'next-view-transitions'
import {useEffect, useState} from 'react'
import {useRizeBackfill} from '@/components/onboarding/useRizeBackfill'

const AboutNextControl = () => {
	const router = useTransitionRouter()
	const {status, fetchStatus} = useRizeBackfill()
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!isLoading) return
		if (status === 'complete') {
			router.replace('/app/onboarding?step=resume')
		} else if (status === 'error' || status === 'idle') {
			setIsLoading(false)
			router.push('/app/onboarding?step=personal-details')
		}
	}, [isLoading, status, router])

	const handleClick = async () => {
		if (status === 'complete') {
			router.replace('/app/onboarding?step=resume')
			return
		}
		if (status === 'pending' || status === 'idle') {
			setIsLoading(true)
			await fetchStatus()
			return
		}
		router.push('/app/onboarding?step=personal-details')
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading}
			className="transition rounded-full shadow-lg px-6 hover:shadow-xl"
			variant="secondary"
		>
			{isLoading ? 'Loading…' : 'Sounds great'}
			<ChevronRight className="w-5 h-5 ml-1" />
		</Button>
	)
}

export default AboutNextControl


