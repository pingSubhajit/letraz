'use client'

import {Issue, LinearClient} from '@linear/sdk'
import {useEffect, useState} from 'react'
import {getCookie} from 'cookies-next'

const useLinearClient = () => {
	const [issues, setIssues] = useState<Issue[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchIssues = async () => {
			try {
				const token = getCookie('linear_access_token')

				if (!token) {
					setError('No access token found')
					setIsLoading(false)
					return
				}

				const linearClient = new LinearClient({
					accessToken: token.toString()
				})

				const me = await linearClient.viewer
				const myIssues = await me.assignedIssues({
					filter: {
						state: {
							name: {
								eq: 'In Progress'
							}
						}
					}
				})

				setIssues(myIssues.nodes)
			} catch (err) {
				setError('Failed to fetch issues')
			} finally {
				setIsLoading(false)
			}
		}

		fetchIssues()
	}, [])

	return {issues, isLoading, error}
}

export default useLinearClient
