'use client'

import {motion} from 'motion/react'
import {LucideIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {useRef, useEffect} from 'react'

interface Tab {
	title: string
	icon: LucideIcon
	id: string
}

interface MobileSectionTabsProps {
	tabs: Tab[]
	activeTab: number
	onTabChange: (index: number) => void
	className?: string
}

const MobileSectionTabs = ({
	tabs,
	activeTab,
	onTabChange,
	className
}: MobileSectionTabsProps) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const activeTabRef = useRef<HTMLButtonElement>(null)

	// Auto-scroll to active tab
	useEffect(() => {
		if (activeTabRef.current && scrollContainerRef.current) {
			const container = scrollContainerRef.current
			const activeElement = activeTabRef.current
			const containerWidth = container.offsetWidth
			const elementLeft = activeElement.offsetLeft
			const elementWidth = activeElement.offsetWidth

			// Center the active tab
			const scrollTo = elementLeft - containerWidth / 2 + elementWidth / 2
			container.scrollTo({
				left: scrollTo,
				behavior: 'smooth'
			})
		}
	}, [activeTab])

	return (
		<div
			ref={scrollContainerRef}
			className={cn(
				'flex gap-1 overflow-x-auto px-3 pb-2',
			'min-[494px]:justify-center',
				'scrollbar-hide snap-x snap-mandatory',
				className
			)}
			style={{
				scrollbarWidth: 'none',
				msOverflowStyle: 'none'
			}}
		>
			{tabs.map((tab, index) => {
				const Icon = tab.icon
				const isActive = activeTab === index

				return (
					<motion.button
						key={tab.id}
						ref={isActive ? activeTabRef : null}
						onClick={() => onTabChange(index)}
						className={cn(
							'flex flex-col items-center justify-center gap-1',
							'min-w-[68px] px-2 py-2 rounded-xl',
							'transition-all duration-200 snap-center',
							'shrink-0',
							isActive
								? 'bg-white shadow-md border border-neutral-200'
								: 'bg-transparent'
						)}
						whileTap={{scale: 0.95}}
					>
						<Icon
							className={cn(
								'w-5 h-5 transition-colors',
								isActive ? 'text-flame-600' : 'text-neutral-600'
							)}
						/>
						<span
							className={cn(
								'text-xs font-medium transition-colors',
								isActive ? 'text-flame-700' : 'text-neutral-600'
							)}
						>
							{tab.title}
						</span>
					</motion.button>
				)
			})}
		</div>
	)
}

export default MobileSectionTabs
