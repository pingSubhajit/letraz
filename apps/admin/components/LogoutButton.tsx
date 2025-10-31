'use client'

import {LogOut} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {useRouter} from 'next/navigation'
import {deleteCookie} from 'cookies-next'

export const LogoutButton = () => {
	const router = useRouter()

	const handleLogout = () => {
		deleteCookie('linear_access_token')
		router.refresh()
	}

	return (
		<Button
			onClick={handleLogout}
			variant="ghost"
			size="sm"
			className="gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
		>
			<LogOut className="h-4 w-4" />
			<span className="font-medium">Sign out</span>
		</Button>
	)
}
