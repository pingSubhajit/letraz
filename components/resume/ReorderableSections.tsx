'use client'

import React, {useState} from 'react'
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	UniqueIdentifier,
	useSensor,
	useSensors
} from '@dnd-kit/core'
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {restrictToParentElement, restrictToVerticalAxis} from '@dnd-kit/modifiers'
import {ResumeSection} from '@/lib/resume/types'
import {Button} from '@/components/ui/button'
import {GripVertical} from 'lucide-react'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'
import {useRearrangeResumeSectionsMutation} from '@/lib/resume/mutations'

interface ReorderableSectionsProps {
	sections: ResumeSection[]
	resumeId: string
	className?: string
	renderSection: (section: ResumeSection, isFirstInGroup: boolean) => { title: React.ReactNode; content: React.ReactNode }
}

interface SortableItemProps {
	id: UniqueIdentifier
	section: ResumeSection
	index: number
	totalSections: number
	isFirstInGroup: boolean
	renderSection: (section: ResumeSection, isFirstInGroup: boolean) => { title: React.ReactNode; content: React.ReactNode }
}

// Group sections by type
const groupSectionsByType = (sections: ResumeSection[]) => {
	const groups: { [key: string]: ResumeSection[] } = {}
	const groupOrder: string[] = []

	sections.forEach(section => {
		if (!groups[section.type]) {
			groups[section.type] = []
			groupOrder.push(section.type)
		}
		groups[section.type].push(section)
	})

	return {groups, groupOrder}
}

const SortableItem: React.FC<SortableItemProps> = ({
	id,
	section,
	index,
	totalSections,
	isFirstInGroup,
	renderSection
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({id})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 999 : 1
	}

	const sectionData = renderSection(section, isFirstInGroup)

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'relative group',
				isDragging && 'opacity-30 z-[999] transition-opacity duration-150'
			)}
		>
			{/* Drag Handle - positioned relative to content */}
			<div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<Button
					variant="outline"
					size="sm"
					{...attributes}
					{...listeners}
					className="h-7 w-7 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200 cursor-grab active:cursor-grabbing"
					aria-label="Drag to reorder"
				>
					<GripVertical className="h-3 w-3" />
				</Button>
			</div>

			{/* Section Content */}
			<motion.div
				className={cn(
					'space-y-4 transition-all duration-200',
					index === totalSections - 1 ? 'pb-4' : ''
				)}
				layout
				transition={{
					duration: 0.3,
					ease: 'easeInOut',
					type: 'spring',
					stiffness: 300,
					damping: 30
				}}
			>
				{sectionData.content}
			</motion.div>
		</div>
	)
}

interface SectionGroupProps {
	groupType: string
	sections: ResumeSection[]
	resumeId: string
	renderSection: (section: ResumeSection, isFirstInGroup: boolean) => { title: React.ReactNode; content: React.ReactNode }
	onReorder: (groupType: string, newOrder: ResumeSection[]) => void
	isFirstGroup: boolean
}

const SectionGroup: React.FC<SectionGroupProps> = ({
	groupType,
	sections,
	resumeId,
	renderSection,
	onReorder,
	isFirstGroup
}) => {
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8
			}
		}),
		useSensor(KeyboardSensor)
	)

	const handleDragStart = (event: DragStartEvent) => {
		const {active} = event
		setActiveId(active.id)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event
		setActiveId(null)

		if (!over) return

		if (active.id !== over.id) {
			const oldIndex = sections.findIndex(section => section.id === active.id)
			const newIndex = sections.findIndex(section => section.id === over.id)

			const newOrder = arrayMove(sections, oldIndex, newIndex)
			onReorder(groupType, newOrder)
		}
	}

	const activeSection = sections.find(section => section.id === activeId)

	const renderDragPreview = (section: ResumeSection) => {
		const sectionData = renderSection(section, false)
		// Only render content in drag preview, not title
		return sectionData.content
	}

	// Get the title from the first section
	const firstSectionData = renderSection(sections[0], true)
	const groupTitle = firstSectionData.title

	return (
		<div className={cn('relative', !isFirstGroup && 'mt-6')}>
			{/* Group Title - stays in place during drag */}
			{groupTitle}

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			>
				<SortableContext
					items={sections.map(section => section.id)}
					strategy={verticalListSortingStrategy}
				>
					<motion.div layout>
						{sections.map((section, index) => (
							<SortableItem
								key={section.id}
								id={section.id}
								section={section}
								index={index}
								totalSections={sections.length}
								isFirstInGroup={false} // Always false now since title is handled at group level
								renderSection={renderSection}
							/>
						))}
					</motion.div>
				</SortableContext>

				<DragOverlay>
					{activeSection ? (
						<div className="bg-white shadow-lg rounded-lg opacity-90 scale-105 p-4">
							{renderDragPreview(activeSection)}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}

const ReorderableSections: React.FC<ReorderableSectionsProps> = ({
	sections,
	resumeId,
	className,
	renderSection
}) => {
	const [localSections, setLocalSections] = useState(sections)
	const rearrangeMutation = useRearrangeResumeSectionsMutation()

	React.useEffect(() => {
		setLocalSections(sections)
	}, [sections])

	const handleGroupReorder = (groupType: string, newOrder: ResumeSection[]) => {
		// Update local state by replacing the sections of the specific group
		setLocalSections(prevSections => {
			const {groups, groupOrder} = groupSectionsByType(prevSections)
			groups[groupType] = newOrder

			// Rebuild the sections array maintaining group order
			const newSections: ResumeSection[] = []
			groupOrder.forEach(type => {
				newSections.push(...groups[type])
			})

			return newSections
		})

		// Send API request with the new complete order
		const {groups, groupOrder} = groupSectionsByType(localSections)
		groups[groupType] = newOrder

		const newSections: ResumeSection[] = []
		groupOrder.forEach(type => {
			newSections.push(...groups[type])
		})

		const sectionIds = newSections.map(section => section.id)
		rearrangeMutation.mutate({resumeId, sectionIds})
	}

	const {groups, groupOrder} = groupSectionsByType(localSections)

	return (
		<div className={cn('relative', className)}>
			{groupOrder.map((groupType, groupIndex) => (
				<SectionGroup
					key={groupType}
					groupType={groupType}
					sections={groups[groupType]}
					resumeId={resumeId}
					renderSection={renderSection}
					onReorder={handleGroupReorder}
					isFirstGroup={groupIndex === 0}
				/>
			))}
		</div>
	)
}

export default ReorderableSections
