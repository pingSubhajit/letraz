'use client'

import {Button} from '@/components/ui/button'
import {SiLinear} from 'react-icons/si'
import {useState} from 'react'
import {cn} from '@/lib/utils'

const LinearConnectButton = () => {
	const [isConnecting, setIsConnecting] = useState(false)

	const handleConnect = async () => {
		setIsConnecting(true)
		try {
			const params = new URLSearchParams({
				client_id: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID!,
				redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/api/linear/callback',
				response_type: 'code',
				state: crypto.randomUUID(),
				scope: 'read'
			})

			window.location.href = `https://linear.app/oauth/authorize?${params.toString()}`
		} catch (error) {
			setIsConnecting(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800">
				<Button
					onClick={handleConnect}
					disabled={isConnecting}
					className={cn(
						'w-full relative',
						'hover:bg-neutral-100 dark:hover:bg-neutral-800',
						'transition-all duration-200 ease-in-out'
					)}
					variant="outline"
					size="lg"
				>
					<SiLinear className="mr-2 h-5 w-5" />
					<span>{isConnecting ? 'Connecting...' : 'Connect Linear Account'}</span>
				</Button>

				<p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">
					By connecting, you will be able to access your Linear issues and create PRs
					automatically
				</p>
			</div>

			<div className="text-xs text-center text-neutral-400">
				Your data is secure and we only request necessary permissions
			</div>
		</div>
	)
}

export default LinearConnectButton
