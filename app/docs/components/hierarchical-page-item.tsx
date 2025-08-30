'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState} from 'react'

import {Button} from '@/components/ui/button'
import {ChevronRight} from 'lucide-react'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible'
import {cn} from '@/lib/utils'
import type {DocPage} from '../../../lib/basehub'

interface HierarchicalPageItemProps {
  page: DocPage
}

export const HierarchicalPageItem = ({page}: HierarchicalPageItemProps) => {
	const pathname = usePathname()
	const hasChildren = page.children && page.children.length > 0

	// All categories are expanded by default, users can manually collapse them
	const [isOpen, setIsOpen] = useState(true)

	if (hasChildren) {
		return (
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-center w-full group gap-0.5">
					{/* Accordion Trigger - expandable arrow */}
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							animation="subtle"
							className="w-4 h-8 p-0 rounded-l-none"
							onClick={(e) => {
								e.stopPropagation()
							}}
						>
							<ChevronRight className={cn(
								'h-4 w-4 transition-transform',
								pathname === `/docs/${page.slug}` && 'text-flame-500',
								isOpen && 'rotate-90'
							)} />
						</Button>
					</CollapsibleTrigger>

					{/* Page Link - clickable to navigate */}
					<Button
						variant="ghost"
						size="sm"
						animation="subtle"
						className={cn(
							'h-8 flex-1 justify-start font-medium mr-0 rounded-r-none px-0 text-muted-foreground',
							pathname === `/docs/${page.slug}` && 'text-flame-500'
						)}
						asChild
					>
						<Link href={`/docs/${page.slug}`}>
							{page.title}
						</Link>
					</Button>
				</div>

				<CollapsibleContent className="pl-4">
					{page.children!.map((child) => (
						<Button
							key={child._id}
							variant="ghost"
							size="sm"
							animation="subtle"
							className={cn(
								'h-8 w-full justify-start text-muted-foreground px-0',
								pathname === `/docs/${child.slug}` && 'text-flame-500'
							)}
							asChild
						>
							<Link href={`/docs/${child.slug}`}>
								{child.title}
							</Link>
						</Button>
					))}
				</CollapsibleContent>
			</Collapsible>
		)
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			animation="subtle"
			className={cn(
				'h-8 w-full justify-start',
				pathname === `/docs/${page.slug}` && 'text-flame-500'
			)}
			asChild
		>
			<Link href={`/docs/${page.slug}`}>
				{page.title}
			</Link>
		</Button>
	)
}
