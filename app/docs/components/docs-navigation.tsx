import {Separator} from '@/components/ui/separator'
import {getAllDocumentationPages, getDocumentationPages} from '../lib/basehub'
import {SearchDocs} from './search-docs'
import {HierarchicalPageItem} from './hierarchical-page-item'

export const DocsNavigation = async () => {
	const [hierarchicalPages, allPages] = await Promise.all([
		getDocumentationPages(),
		getAllDocumentationPages()
	])

	return (
		<div className="w-full">
			<div className="pb-4">
				<h4 className="mb-1 text-sm font-semibold leading-none">Documentation</h4>
				<p className="text-sm text-muted-foreground">
					Guides and references for using Letraz
				</p>
			</div>

			{/* Search - uses flat list for searching */}
			<div className="mb-4">
				<SearchDocs pages={allPages} />
			</div>

			<Separator className="mb-4" />

			{/* Hierarchical Documentation pages */}
			{hierarchicalPages.length > 0 && (
				<div>
					{hierarchicalPages.map((page) => (
						<HierarchicalPageItem key={page._id} page={page} />
					))}
				</div>
			)}
		</div>
	)
}
