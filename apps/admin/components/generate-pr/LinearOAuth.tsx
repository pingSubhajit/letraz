import {SiLinear} from 'react-icons/si'
import LinearConnectButton from './LinearConnectButton'

export const LinearOAuth = () => {
	return (
		<div className="flex flex-col items-center justify-start pt-20">
			<div className="flex flex-col items-center">
				<div className="mb-8">
					<SiLinear className="h-16 w-16 text-neutral-900 dark:text-neutral-100" />
				</div>
				<div className="w-full max-w-md space-y-6 px-4">
					<div className="space-y-2">
						<div className="flex items-center justify-center gap-2">
							<h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
								Connect to Linear
							</h1>
						</div>
						<p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
							Link your Linear account to start generating PR descriptions automatically
						</p>
					</div>
					<LinearConnectButton />
				</div>
			</div>
		</div>
	)
}
