'use client'

import {useEffect, useState} from 'react'
import {cn} from '@/lib/utils'
import {ScrollArea} from '@/components/ui/scroll-area'
import {RxTextAlignLeft} from 'react-icons/rx'

interface TOCItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content?: string
}

const TableOfContents = ({content = ''}: TableOfContentsProps) => {
	const [tocItems, setTocItems] = useState<TOCItem[]>([])
	const [activeId, setActiveId] = useState<string>('')

	useEffect(() => {
		// Add a small delay to ensure DOM content is fully rendered
		const timeout = setTimeout(() => {
			const headingElements = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content h4, .docs-content h5, .docs-content h6')
			const items: TOCItem[] = []

			// Seed with all existing DOM IDs to avoid collisions when we GENERATE new ones.
			const usedIds = new Set<string>(
				typeof document !== 'undefined'
					? Array.from(document.querySelectorAll('[id]'))
						.map(el => (el as HTMLElement).id?.trim())
						.filter((id): id is string => !!id && id.length > 0)
					: []
			)

			headingElements.forEach((heading) => {
				const level = parseInt(heading.tagName.charAt(1))
				const title = (heading.textContent || '').trim()

				if (title) {
					const existing = (heading as HTMLElement).id?.trim()
					let finalId: string

					if (existing) {
						// Keep existing IDs untouched to preserve deep links.
						finalId = existing
					} else {
						// Generate new slug from title
						finalId = title
							.toLowerCase()
							.replace(/[^a-z0-9\s-]/g, '')
							.replace(/\s+/g, '-')
							.replace(/-{2,}/g, '-')
							.replace(/^-+|-+$/g, '')
							.trim()

						// Ensure uniqueness only for generated IDs
						let counter = 1
						const base = finalId || 'section'
						finalId = base
						while (usedIds.has(finalId)) {
							finalId = `${base}-${counter++}`
						}
						;(heading as HTMLElement).id = finalId
						usedIds.add(finalId)
					}

					items.push({id: finalId, title, level})
				}
			})
			setTocItems(items)
		}, 100) // Small delay to ensure DOM is ready

		return () => clearTimeout(timeout)
	}, [content]) // Re-run when content changes

	useEffect(() => {
		if (tocItems.length === 0) return

		// Set up intersection observer for active heading detection
		const headingElements = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content h4, .docs-content h5, .docs-content h6')

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
					}
				})
			},
			{
				rootMargin: '-80px 0px -80% 0px',
				threshold: 0.5
			}
		)

		headingElements.forEach((heading) => {
			if (heading.id) {
				observer.observe(heading)
			}
		})

		return () => {
			observer.disconnect()
		}
	}, [tocItems])

	const scrollToHeading = (id: string) => {
		const element = document.getElementById(id)

		if (element) {
			const offset = 80 // Account for fixed header
			const elementPosition = element.offsetTop - offset

			// Update URL hash without triggering scroll
			if (typeof window !== 'undefined') {
				window.history.pushState(null, '', `#${id}`)
			}

			window.scrollTo({
				top: elementPosition,
				behavior: 'smooth'
			})
		}
	}

	return (
		<div className="docs-toc">
			<div className="space-y-2">
				<p className="font-medium flex items-center text-sm gap-1.5">
					<span><RxTextAlignLeft /></span>
					On This Page
				</p>
				{tocItems.length === 0 ? (
					<p className="text-sm text-muted-foreground py-2">
						No headings found
					</p>
				) : (
					<ScrollArea className="pb-6">
						<div className="space-y-0.5">
							{tocItems.map((item) => (
								<a
									key={item.id}
									href={`#${item.id}`}
									onClick={(e) => {
										e.preventDefault()
										scrollToHeading(item.id)
									}}
									aria-current={activeId === item.id ? 'true' : undefined}
									className={cn(
										'block w-full text-left px-0 py-0.5 text-sm rounded transition-colors',
										'text-muted-foreground hover:text-flame-500 no-underline',

										{
											'text-flame-500 font-medium': activeId === item.id,
											'pl-3': item.level === 3,
											'pl-6': item.level === 4,
											'pl-9': item.level >= 5
										}
									)}
								>
									{item.title}
								</a>
							))}
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	)
}

export default TableOfContents
