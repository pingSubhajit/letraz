import {Separator} from '@/components/ui/separator'
import {getAllDocumentationPages, getDocumentationPages} from '../../../lib/basehub'
import {HierarchicalPageItem} from './hierarchical-page-item'
import {Button} from '@/components/ui/button'
import {Search} from 'lucide-react'

export const DocsNavigation = async () => {
	const [hierarchicalPages, allPages] = await Promise.all([
		getDocumentationPages(),
		getAllDocumentationPages()
	])

	return (
		<div className="w-full">
			{/* Search - uses flat list for searching */}
			<div className="mb-4">
				<Button variant="secondary" className="w-full text-muted-foreground gap-1.5 justify-start">
					<Search className="w-4 aspect-square" />
					Search documentation
				</Button>
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
