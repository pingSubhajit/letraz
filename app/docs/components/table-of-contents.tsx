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
			const usedIds = new Set<string>()

			headingElements.forEach((heading) => {
				const level = parseInt(heading.tagName.charAt(1))
				const title = (heading.textContent || '').trim()

				if (title) {
					// Always generate a fresh ID to avoid conflicts
					let id = title
						.toLowerCase()
						.replace(/[^a-z0-9\s-]/g, '') // Keep letters, numbers, spaces, and hyphens
						.replace(/\s+/g, '-') // Replace spaces with hyphens
						.replace(/-{2,}/g, '-') // Replace multiple consecutive hyphens with single hyphen
						.replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens only
						.trim()

					// Ensure uniqueness
					let counter = 0
					let originalId = id
					while (usedIds.has(id)) {
						counter++
						id = `${originalId}-${counter}`
					}

					// Always set the ID, even if heading already has one
					heading.id = id
					usedIds.add(id)

					items.push({id, title, level})
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
								<button
									key={item.id}
									onClick={() => scrollToHeading(item.id)}
									className={cn(
										'block w-full text-left px-0 py-0.5 text-sm rounded transition-colors',
										'text-muted-foreground hover:text-flame-500',
										{
											'text-flame-500 font-medium': activeId === item.id,
											'pl-3': item.level === 3,
											'pl-6': item.level === 4,
											'pl-9': item.level >= 5
										}
									)}
								>
									{item.title}
								</button>
							))}
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	)
}

export default TableOfContents
