import {cookies} from 'next/headers'
import {AuthWrapper} from './AuthWrapper'

type AuthStateProviderProps = {
	children: React.ReactNode
}

export const AuthStateProvider = async ({children}: AuthStateProviderProps) => {
	const cookieStore = await cookies()
	const token = cookieStore.get('linear_access_token')
	const initialAuthState = Boolean(token)

	return (
		<AuthWrapper initialAuthState={initialAuthState}>
			{children}
		</AuthWrapper>
	)
}
