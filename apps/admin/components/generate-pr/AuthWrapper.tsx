'use client'

import {useState} from 'react'
import {LinearOAuth} from './LinearOAuth'

type AuthWrapperProps = {
	children: React.ReactNode
	initialAuthState: boolean
}

export const AuthWrapper = ({children, initialAuthState}: AuthWrapperProps) => {
	const [isAuthenticated] = useState(initialAuthState)

	if (!isAuthenticated) {
		return <LinearOAuth />
	}

	return children
}
