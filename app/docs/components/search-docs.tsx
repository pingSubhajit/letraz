'use client'

import {useState} from 'react'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Search, X} from 'lucide-react'
import {DocPage} from '../lib/basehub'
import Link from 'next/link'

interface SearchDocsProps {
  pages: DocPage[]
}

export function SearchDocs({pages}: SearchDocsProps) {
	const [query, setQuery] = useState('')
	const [isOpen, setIsOpen] = useState(false)

	const filteredPages = query.trim()
		? pages.filter(
			(page) => page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.description?.toLowerCase().includes(query.toLowerCase()) ||
          page.body?.toLowerCase().includes(query.toLowerCase())
		)
		: []

	return (
		<div className="relative">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search documentation..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						setIsOpen(true)
					}}
					onFocus={() => setIsOpen(true)}
					className="pl-10 pr-10"
				/>
				{query && (
					<Button
						size="sm"
						variant="ghost"
						onClick={() => {
							setQuery('')
							setIsOpen(false)
						}}
						className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-muted-foreground hover:text-foreground"
					>
						<X className="h-3 w-3" />
					</Button>
				)}
			</div>

			{/* Search Results */}
			{isOpen && query && (
				<div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-background p-2 shadow-lg">
					{filteredPages.length > 0 ? (
						<div className="space-y-1">
							{filteredPages.slice(0, 8).map((page) => (
								<Link
									key={page._id}
									href={`/docs/${page.slug}`}
									onClick={() => {
										setQuery('')
										setIsOpen(false)
									}}
									className="block rounded-md p-3 text-sm transition-colors hover:bg-muted"
								>
									<div className="font-medium">{page.title}</div>
									{page.description && (
										<div className="text-muted-foreground">{page.description}</div>
									)}
								</Link>
							))}
							{filteredPages.length > 8 && (
								<div className="p-2 text-center text-xs text-muted-foreground">
									And {filteredPages.length - 8} more results...
								</div>
							)}
						</div>
					) : (
						<div className="p-3 text-center text-sm text-muted-foreground">
							No results found for "{query}"
						</div>
					)}
				</div>
			)}
		</div>
	)
}
