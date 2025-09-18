import {getAllDocumentationPages, getDocumentationPages} from '@/lib/basehub'
import {HierarchicalPageItem} from './hierarchical-page-item'
import {Mail, Newspaper} from 'lucide-react'
import Link from 'next/link'
import {Discord, GitHubLight} from '@ridemountainpig/svgl-react'
import {discordHandle, githubHandle} from '@/config'
import {DocsSearchButton} from '@/app/docs/components/docs-search-button'

export const DocsNavigation = async () => {
	const [hierarchicalPages, allPages] = await Promise.all([
		getDocumentationPages(),
		getAllDocumentationPages()
	])

	return (
		<div className="w-full">
			{/* Search - uses flat list for searching */}
			<div className="mb-6">
				<DocsSearchButton allPages={allPages} />
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
					href="/support"
					className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
				>
					<Mail className="w-4 h-4" />
					<span>Support</span>
				</Link>

				<Link
					href={githubHandle}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
				>
					<GitHubLight className="w-4 h-4" />
					<span>GitHub</span>
				</Link>

				<Link
					href={discordHandle}
					target="_blank"
					rel="noopener noreferrer"
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
