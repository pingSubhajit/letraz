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
import {ResumeSection, ResumeSectionSchema} from '@/lib/resume/types'
import {Button} from '@/components/ui/button'
import {ChevronDown, ChevronUp, GripVertical} from 'lucide-react'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'
import {useRearrangeResumeSectionsMutation} from '@/lib/resume/mutations'
import {Education} from '@/lib/education/types'
import {Experience} from '@/lib/experience/types'
import EducationSection from '@/components/resume/themes/DEAFULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEAFULT_THEME/sections/ExperienceSection'

interface ReorderableSectionsProps {
	sections: ResumeSection[]
	resumeId: string
	className?: string
}

interface SortableItemProps {
	id: UniqueIdentifier
	section: ResumeSection
	index: number
	totalSections: number
	onMoveUp: (id: string) => void
	onMoveDown: (id: string) => void
	previousSectionType?: typeof ResumeSectionSchema._type.type
}

const SortableItem: React.FC<SortableItemProps> = ({
	id,
	section,
	index,
	totalSections,
	onMoveUp,
	onMoveDown,
	previousSectionType
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

	const renderSectionContent = () => {
		if (section.type === 'Education') {
			return (
				<EducationSection
					section={section as ResumeSection & { type: 'Education', data: Education }}
					previousSectionType={previousSectionType}
				/>
			)
		} else if (section.type === 'Experience') {
			return (
				<ExperienceSection
					section={section as ResumeSection & { type: 'Experience', data: Experience }}
					previousSectionType={previousSectionType}
				/>
			)
		}
		return null
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'relative group',
				isDragging && 'opacity-30 z-[999] transition-opacity duration-150'
			)}
		>
			{/* Drag Handle and Buttons - Nested hover behavior */}
			<div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100 group/controls">
				{index > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onMoveUp(section.id)}
						className="h-7 w-7 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200 opacity-0 group-hover/controls:opacity-100 transition-opacity duration-150"
						aria-label="Move section up"
					>
						<ChevronUp className="h-3 w-3" />
					</Button>
				)}

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

				{index < totalSections - 1 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onMoveDown(section.id)}
						className="h-7 w-7 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200 opacity-0 group-hover/controls:opacity-100 transition-opacity duration-150"
						aria-label="Move section down"
					>
						<ChevronDown className="h-3 w-3" />
					</Button>
				)}
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
				{renderSectionContent()}
			</motion.div>
		</div>
	)
}

const ReorderableSections: React.FC<ReorderableSectionsProps> = ({
	sections,
	resumeId,
	className
}) => {
	const [localSections, setLocalSections] = useState(sections)
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
	const rearrangeMutation = useRearrangeResumeSectionsMutation()

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8
			}
		}),
		useSensor(KeyboardSensor)
	)

	React.useEffect(() => {
		setLocalSections(sections)
	}, [sections])

	const handleDragStart = (event: DragStartEvent) => {
		const {active} = event
		setActiveId(active.id)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event
		setActiveId(null)

		if (!over) return

		if (active.id !== over.id) {
			const oldIndex = localSections.findIndex(section => section.id === active.id)
			const newIndex = localSections.findIndex(section => section.id === over.id)

			const newSections = arrayMove(localSections, oldIndex, newIndex)
			setLocalSections(newSections)

			// Send API request
			const sectionIds = newSections.map(section => section.id)
			rearrangeMutation.mutate({resumeId, sectionIds})
		}
	}

	const handleMoveUp = (id: string) => {
		const currentIndex = localSections.findIndex(section => section.id === id)
		if (currentIndex > 0) {
			const newSections = arrayMove(localSections, currentIndex, currentIndex - 1)
			setLocalSections(newSections)

			const sectionIds = newSections.map(section => section.id)
			rearrangeMutation.mutate({resumeId, sectionIds})
		}
	}

	const handleMoveDown = (id: string) => {
		const currentIndex = localSections.findIndex(section => section.id === id)
		if (currentIndex < localSections.length - 1) {
			const newSections = arrayMove(localSections, currentIndex, currentIndex + 1)
			setLocalSections(newSections)

			const sectionIds = newSections.map(section => section.id)
			rearrangeMutation.mutate({resumeId, sectionIds})
		}
	}

	const activeSection = localSections.find(section => section.id === activeId)

	const renderDragPreview = (section: ResumeSection) => {
		if (section.type === 'Education') {
			return (
				<EducationSection
					section={section as ResumeSection & { type: 'Education', data: Education }}
					previousSectionType={undefined}
				/>
			)
		} else if (section.type === 'Experience') {
			return (
				<ExperienceSection
					section={section as ResumeSection & { type: 'Experience', data: Experience }}
					previousSectionType={undefined}
				/>
			)
		}
		return null
	}

	return (
		<div className={cn('relative', className)}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			>
				<SortableContext
					items={localSections.map(section => section.id)}
					strategy={verticalListSortingStrategy}
				>
					<motion.div layout>
						{localSections.map((section, index) => (
							<SortableItem
								key={section.id}
								id={section.id}
								section={section}
								index={index}
								totalSections={localSections.length}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
								previousSectionType={localSections[index - 1]?.type}
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

export default ReorderableSections
