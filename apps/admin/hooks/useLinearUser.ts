'use client'

import {useEffect, useState} from 'react'
import {LinearClient} from '@linear/sdk'
import {getCookie} from 'cookies-next'

export interface LinearUser {
  id: string
  name: string
  displayName: string
  email: string
  avatarUrl?: string
  organization: {
    id: string
    name: string
  }
}

export interface UseLinearUserReturn {
  user: LinearUser | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

// Custom hook to get Linear user information
export const useLinearUser = (): UseLinearUserReturn => {
	const [user, setUser] = useState<LinearUser | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const token = getCookie('linear_access_token') as string

				if (!token) {
					setUser(null)
					setIsLoading(false)
					return
				}

				const linearClient = new LinearClient({
					accessToken: token
				})

				// Get current user (viewer)
				const viewer = await linearClient.viewer

				if (!viewer) {
					throw new Error('Failed to get user information')
				}

				// Get organization info
				const organization = await viewer.organization

				const userInfo: LinearUser = {
					id: viewer.id,
					name: viewer.name,
					displayName: viewer.displayName,
					email: viewer.email,
					avatarUrl: viewer.avatarUrl || undefined,
					organization: {
						id: organization.id,
						name: organization.name
					}
				}

				setUser(userInfo)
				setError(null)
			} catch (err) {
				console.error('Failed to fetch Linear user info:', err)
				setError(err instanceof Error ? err.message : 'Failed to get user information')
				setUser(null)
			} finally {
				setIsLoading(false)
			}
		}

		fetchUserInfo()
	}, [])

	return {
		user,
		isLoading,
		error,
		isAuthenticated: !!user
	}
}
