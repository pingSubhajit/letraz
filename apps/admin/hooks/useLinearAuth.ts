'use client'

import {useEffect, useState} from 'react'
import {checkLinearAuth} from '@/lib/actions/checkLinearAuth'

const useLinearAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const init = async () => {
			try {
				const {isAuthenticated: authStatus} = await checkLinearAuth()
				setIsAuthenticated(authStatus)
			} catch (error) {
				// console.error('Failed to check auth status:', error)
			} finally {
				setIsLoading(false)
			}
		}

		init()
	}, [])

	return {
		isAuthenticated: Boolean(isAuthenticated),
		isLoading: isLoading
	}
}

export default useLinearAuth
