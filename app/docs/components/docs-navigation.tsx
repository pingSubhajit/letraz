import {getAllDocumentationPages, getDocumentationPages} from '../../../lib/basehub'
import {HierarchicalPageItem} from './hierarchical-page-item'
import {Button} from '@/components/ui/button'
import {Mail, Newspaper, Search} from 'lucide-react'
import Link from 'next/link'
import {Discord, GitHubLight} from '@ridemountainpig/svgl-react'

export const DocsNavigation = async () => {
	const [hierarchicalPages, allPages] = await Promise.all([
		getDocumentationPages(),
		getAllDocumentationPages()
	])

	return (
		<div className="w-full">
			{/* Search - uses flat list for searching */}
			<div className="mb-6">
				<Button variant="secondary" className="w-full text-muted-foreground gap-1.5 justify-start">
					<Search className="w-4 aspect-square" />
					Search documentation
				</Button>
			</div>

			{/* Additional Navigation Links */}
			<div className="mb-6 space-y-4">
				<Link
					href="/changes"
					className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
				>
					<Newspaper className="w-4 h-4" />
					<span>Changelog</span>
				</Link>

				<Link
					href="mailto:support@letraz.com"
					className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
				>
					<Mail className="w-4 h-4" />
					<span>Support</span>
				</Link>

				<Link
					href="https://github.com/letraz/letraz-client"
					target="_blank"
					className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
				>
					<GitHubLight className="w-4 h-4" />
					<span>GitHub</span>
				</Link>

				<Link
					href="https://discord.gg/letraz"
					target="_blank"
					className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
				>
					<Discord className="w-4 h-4" />
					<span>Discord</span>
				</Link>
			</div>

			{/* Hierarchical Documentation pages */}
			{hierarchicalPages.length > 0 && (
				<div className="mb-6">
					{hierarchicalPages.map((page) => (
						<HierarchicalPageItem key={page._id} page={page} />
					))}
				</div>
			)}
		</div>
	)
}
