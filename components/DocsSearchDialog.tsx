'use client'

import React, {useCallback, useEffect, useState} from 'react'
import {useHotkeys} from '@mantine/hooks'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import {FileText, Hash} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {DocPage} from '@/lib/basehub'

interface SearchResult {
	_id: string
	title: string
	slug: string
	description?: string
	body?: string
	snippet?: string
}

interface DocsSearchDialogProps {
	searchKey?: string
	allPages: DocPage[]
}

// Export a ref-based version for imperative usage
export const DocsSearchDialogRef = React.forwardRef<
	{openDialog:() => void},
	DocsSearchDialogProps
>((props, ref) => {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const router = useRouter()

	// Hotkey binding for ⌘K (Mac) / Ctrl+K (Windows/Linux)
	useHotkeys([
		['mod+K', () => setOpen(true)],
		['/', () => setOpen(true)]
	])

	const openDialog = useCallback(() => {
		setOpen(true)
	}, [])

	React.useImperativeHandle(ref, () => ({
		openDialog
	}))

	// Simple client-side search functionality
	const performSearch = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim()) {
			setSearchResults([])
			return
		}

		setIsSearching(true)

		try {
			// Client-side search through all pages
			const results = props.allPages
				.filter((page) => {
					const searchText = searchQuery.toLowerCase()
					const titleMatch = page.title.toLowerCase().includes(searchText)
					const descriptionMatch = page.description?.toLowerCase().includes(searchText)
					const bodyMatch = page.body?.toLowerCase().includes(searchText)

					return titleMatch || descriptionMatch || bodyMatch
				})
				.slice(0, 10) // Limit to 10 results
				.map((page) => {
					// Create snippet from body or description
					let snippet = ''
					const searchText = searchQuery.toLowerCase()

					if (page.body) {
						const bodyText = page.body.replace(/<[^>]*>/g, '') // Strip HTML
						const index = bodyText.toLowerCase().indexOf(searchText)
						if (index !== -1) {
							const start = Math.max(0, index - 50)
							const end = Math.min(bodyText.length, index + 100)
							snippet = '...' + bodyText.slice(start, end) + '...'
						}
					}

					if (!snippet && page.description) {
						snippet = page.description
					}

					return {
						_id: page._id,
						title: page.title,
						slug: page.slug,
						description: page.description,
						body: page.body,
						snippet
					}
				})

			setSearchResults(results)
		} catch (error) {
			setSearchResults([])
		} finally {
			setIsSearching(false)
		}
	}, [props.allPages])

	// Debounced search
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			performSearch(query)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [query, performSearch])

	const handleSelect = (slug: string) => {
		setOpen(false)
		setQuery('')
		setSearchResults([])
		router.push(`/docs/${slug}`)
	}

	return (
		<>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput
					placeholder="Search documentation..."
					value={query}
					onValueChange={setQuery}
				/>
				<CommandList>
					<CommandEmpty>
						{isSearching ? 'Searching...' : 'No results found.'}
					</CommandEmpty>

					{searchResults.length > 0 && (
						<CommandGroup heading="Documentation">
							{searchResults.map((result) => (
								<CommandItem
									key={result._id}
									value={result.title}
									onSelect={() => handleSelect(result.slug)}
									className="flex items-start gap-3 p-3"
								>
									<FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm">{result.title}</div>
										{result.snippet && (
											<div className="text-xs text-muted-foreground mt-1 line-clamp-2">
												{result.snippet}
											</div>
										)}
									</div>
									<Hash className="w-3 h-3 text-muted-foreground" />
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</CommandDialog>
		</>
	)
})

DocsSearchDialogRef.displayName = 'DocsSearchDialogRef'
