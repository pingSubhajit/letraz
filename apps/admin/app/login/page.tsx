import {Metadata} from 'next'
import LoginScreen from '@/components/auth/LoginScreen'

export const metadata: Metadata = {
	title: 'Login | Letraz Admin',
	description: 'Access the Letraz admin dashboard'
}

const LoginPage = () => (
	<div className="min-h-screen grid place-items-center bg-neutral-50/50 dark:bg-neutral-950/50">
		<LoginScreen />
	</div>
)

export default LoginPage
