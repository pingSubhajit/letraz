'use client'

import {useState} from 'react'
import {motion} from 'motion/react'
import {SiLinear} from 'react-icons/si'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {useSearchParams} from 'next/navigation'
import {GitPullRequest, Lock, Users, Zap} from 'lucide-react'

const LetrazLogo = () => (
	<div className="flex items-center gap-0.5">
		<div className="h-3 w-3 rounded-full bg-white" />
		<div className="h-3 w-3 rounded-full bg-white" />
		<div className="h-3 w-3 rounded-full bg-white" />
	</div>
)

const ConnectionIndicator = () => (
	<div className="relative flex items-center w-8">
		{/* Base line */}
		<div className="absolute w-full h-px bg-neutral-700" />

		{/* Animated dot with glow effect */}
		<motion.div
			animate={{
				x: [0, 32, 0],
				opacity: [0.6, 1, 0.6]
			}}
			transition={{
				duration: 2,
				repeat: Infinity,
				easing: 'ease-in-out'
			}}
			className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.4)] dark:bg-emerald-500 dark:shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]"
		/>
	</div>
)

const LoginScreen = () => {
	const [isConnecting, setIsConnecting] = useState(false)
	const searchParams = useSearchParams()
	const from = searchParams.get('from') || '/'

	const handleConnect = async () => {
		setIsConnecting(true)
		try {
			const params = new URLSearchParams({
				client_id: process.env.NEXT_PUBLIC_LINEAR_CLIENT_ID!,
				redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/api/linear/callback',
				response_type: 'code',
				state: from,
				scope: 'read'
			})

			window.location.href = `https://linear.app/oauth/authorize?${params.toString()}`
		} catch (error) {
			setIsConnecting(false)
		}
	}

	return (
		<div className="relative w-full max-w-md">
			<motion.div
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				className="relative space-y-10 rounded-2xl border border-neutral-200 bg-white/80 px-10 py-16 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80"
			>
				<div className="text-center space-y-8">
					<motion.div
						initial={{scale: 0.8}}
						animate={{scale: 1}}
						transition={{delay: 0.2, type: 'spring'}}
						className="flex justify-center"
					>
						<div className="relative flex items-center gap-4">
							<div className="relative rounded-xl bg-neutral-900 p-4">
								<SiLinear className="h-14 w-14 text-white" />
							</div>

							<ConnectionIndicator />

							<div className="relative rounded-xl bg-neutral-900 p-4">
								<div className="flex h-14 w-14 items-center justify-center">
									<LetrazLogo />
								</div>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						transition={{delay: 0.3}}
						className="space-y-3"
					>
						<div className="space-y-1.5">
							<h1 className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-600 bg-clip-text text-2xl font-medium text-transparent dark:from-white dark:via-neutral-200 dark:to-neutral-400">
								Letraz Admin
							</h1>
							<p className="text-sm text-neutral-500 dark:text-neutral-400">
								Internal tools for Letraz tech team
							</p>
						</div>

						<p className="text-sm text-neutral-600 dark:text-neutral-300">
							Access development workflows and automate technical operations with Linear integration.
						</p>
					</motion.div>
				</div>

				<motion.div
					initial={{opacity: 0, y: 20}}
					animate={{opacity: 1, y: 0}}
					transition={{delay: 0.4}}
					className="space-y-8"
				>
					<div className="space-y-4">
						<div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900/5 dark:bg-white/5">
								<Zap className="h-4 w-4" />
							</span>
							<span>Quick access to development tools</span>
						</div>
						<div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900/5 dark:bg-white/5">
								<GitPullRequest className="h-4 w-4" />
							</span>
							<span>Smart PR descriptions from Linear issues</span>
						</div>
						<div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900/5 dark:bg-white/5">
								<Users className="h-4 w-4" />
							</span>
							<span>Exclusive access for Letraz team</span>
						</div>
					</div>

					<Button
						onClick={handleConnect}
						disabled={isConnecting}
						className={cn(
							'group relative w-full overflow-hidden rounded-xl p-6',
							'bg-neutral-900 dark:bg-neutral-100',
							'text-neutral-100 dark:text-neutral-900',
							'hover:bg-neutral-800 dark:hover:bg-neutral-200',
							'transition-all duration-300 ease-out'
						)}
						size="lg"
					>
						<div className="relative z-10 flex items-center justify-center gap-2">
							<SiLinear className={cn(
								'h-5 w-5 transition-transform duration-300',
								'group-hover:scale-110 group-hover:rotate-3'
							)} />
							<span className="font-medium">
								{isConnecting ? 'Connecting...' : 'Sign in with Linear'}
							</span>
						</div>
					</Button>

					<div className="space-y-5">
						<div className="h-px w-full bg-neutral-200 dark:bg-neutral-800" />

						<motion.div
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							transition={{delay: 0.5}}
							className="space-y-4"
						>
							<p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400 dark:text-neutral-500">
								<Lock className="h-2.5 w-2.5" />
								<span>Protected access for Letraz team members only</span>
							</p>
						</motion.div>
					</div>
				</motion.div>
			</motion.div>
		</div>
	)
}

export default LoginScreen
