import {Metadata} from 'next'
import PRGenerator from '@/components/generate-pr/PRGenerator'
import {AuthStateProvider} from '@/components/generate-pr/AuthStateProvider'

export const metadata: Metadata = {
	title: 'Generate PR | Letraz Admin',
	description: 'Generate pull request descriptions from Linear issues',
	openGraph: {
		title: 'Generate PR | Letraz Admin',
		description: 'Generate pull request descriptions from Linear issues',
		type: 'website'
	}
}

const GeneratePRPage = () => (
	<div className="container mx-auto px-4 py-6">
		<AuthStateProvider>
			<div className="max-w-2xl space-y-6">
				<div>
					<h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
						Generate PR Description
					</h1>
					<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
						Automatically generate pull request descriptions from your Linear issues.
					</p>
				</div>
				<PRGenerator />
			</div>
		</AuthStateProvider>
	</div>
)

export default GeneratePRPage
