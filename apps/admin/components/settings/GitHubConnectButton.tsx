'use client'

import {Button} from '@/components/ui/button'
import {AlertCircle, CheckCircle, Github} from 'lucide-react'
import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {getGitHubClient} from '@/lib/github-api'

interface GitHubConnectButtonProps {
  className?: string
}

export const GitHubConnectButton = ({className}: GitHubConnectButtonProps) => {
	const [isConnecting, setIsConnecting] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected')
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		// Check if GitHub is connected on component mount
		const checkConnection = async () => {
			try {
				const githubClient = getGitHubClient()
				const connected = githubClient.isAuthenticated()

				setIsConnected(connected)
				setConnectionStatus(connected ? 'connected' : 'disconnected')
			} catch (error) {
				setConnectionStatus('error')
			}
		}

		checkConnection()
	}, [])

	const handleConnect = async () => {
		setIsConnecting(true)
		setConnectionStatus('disconnected')

		try {
			const params = new URLSearchParams({
				client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
				redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`,
				scope: 'repo,admin:repo_hook',
				state: crypto.randomUUID()
			})

			window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
		} catch (error) {
			setConnectionStatus('error')
			setIsConnecting(false)
		}
	}

	const handleDisconnect = () => {
		// Clear GitHub cookies
		document.cookie = 'github_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
		document.cookie = 'github_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

		setIsConnected(false)
		setConnectionStatus('disconnected')
	}

	const getStatusIcon = () => {
		switch (connectionStatus) {
		case 'connected':
			return <CheckCircle className="h-4 w-4 text-green-500" />
		case 'error':
			return <AlertCircle className="h-4 w-4 text-red-500" />
		default:
			return <Github className="h-4 w-4" />
		}
	}

	const getStatusText = () => {
		switch (connectionStatus) {
		case 'connected':
			return 'Connected to GitHub'
		case 'error':
			return 'Connection failed'
		default:
			return isConnected ? 'Connected to GitHub' : 'Connect GitHub Account'
		}
	}

	return (
		<div className={cn('flex items-center justify-between', className)}>
			<div className="flex items-center gap-3">
				{getStatusIcon()}
				<div>
					<p className="text-sm font-medium">{getStatusText()}</p>
					<p className="text-xs text-neutral-500 dark:text-neutral-400">
						{isConnected
							? 'GitHub account connected successfully'
							: 'Connect your GitHub account to manage repositories and webhooks'
						}
					</p>
				</div>
			</div>

			<div className="flex gap-2">
				{isConnected && (
					<Button
						onClick={handleDisconnect}
						variant="outline"
						size="sm"
						className="gap-2"
					>
						Disconnect
					</Button>
				)}

				{!isConnected && (
					<Button
						onClick={handleConnect}
						disabled={isConnecting}
						variant="outline"
						className="gap-2"
					>
						<Github className="h-4 w-4" />
						{isConnecting ? 'Connecting...' : 'Connect GitHub'}
					</Button>
				)}
			</div>
		</div>
	)
}
