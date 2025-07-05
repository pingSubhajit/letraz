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
import {Button} from '@/components/ui/button'
import {ChevronDown, ChevronUp, GripVertical} from 'lucide-react'
import {cn} from '@/lib/utils'
import {motion} from 'motion/react'

interface ReorderableListProps<T extends { id: string }> {
	items: T[]
	onReorder: (newOrder: T[]) => void
	renderItem: (item: T, index: number) => React.ReactNode
	className?: string
	label?: string
}

interface SortableItemProps<T extends { id: string }> {
	id: UniqueIdentifier
	item: T
	index: number
	totalItems: number
	onMoveUp: (id: string) => void
	onMoveDown: (id: string) => void
	children: React.ReactNode
}

function SortableItem<T extends { id: string }>({
	id,
	item,
	index,
	totalItems,
	onMoveUp,
	onMoveDown,
	children
}: SortableItemProps<T>) {
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
			<div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100 group/controls">
				{index > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onMoveUp(item.id)}
						className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200 opacity-0 group-hover/controls:opacity-100 transition-opacity duration-150"
						aria-label="Move item up"
					>
						<ChevronUp className="h-3 w-3" />
					</Button>
				)}

				<Button
					variant="outline"
					size="sm"
					{...attributes}
					{...listeners}
					className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200 cursor-grab active:cursor-grabbing"
					aria-label="Drag to reorder"
				>
					<GripVertical className="h-3 w-3" />
				</Button>

				{index < totalItems - 1 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onMoveDown(item.id)}
						className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200 opacity-0 group-hover/controls:opacity-100 transition-opacity duration-150"
						aria-label="Move item down"
					>
						<ChevronDown className="h-3 w-3" />
					</Button>
				)}
			</div>

			{/* Item Content */}
			<motion.div
				layout
				transition={{
					duration: 0.3,
					ease: 'easeInOut',
					type: 'spring',
					stiffness: 300,
					damping: 30
				}}
				className="transition-all duration-200"
			>
				{children}
			</motion.div>
		</div>
	)
}

function ReorderableList<T extends { id: string }>({
	items,
	onReorder,
	renderItem,
	className,
	label = 'items'
}: ReorderableListProps<T>) {
	const [localItems, setLocalItems] = useState(items)
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8
			}
		}),
		useSensor(KeyboardSensor)
	)

	React.useEffect(() => {
		setLocalItems(items)
	}, [items])

	const handleDragStart = (event: DragStartEvent) => {
		const {active} = event
		setActiveId(active.id)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event
		setActiveId(null)

		if (!over) return

		if (active.id !== over.id) {
			const oldIndex = localItems.findIndex(item => item.id === active.id)
			const newIndex = localItems.findIndex(item => item.id === over.id)

			const newItems = arrayMove(localItems, oldIndex, newIndex)
			setLocalItems(newItems)
			onReorder(newItems)
		}
	}

	const handleMoveUp = (id: string) => {
		const currentIndex = localItems.findIndex(item => item.id === id)
		if (currentIndex > 0) {
			const newItems = arrayMove(localItems, currentIndex, currentIndex - 1)
			setLocalItems(newItems)
			onReorder(newItems)
		}
	}

	const handleMoveDown = (id: string) => {
		const currentIndex = localItems.findIndex(item => item.id === id)
		if (currentIndex < localItems.length - 1) {
			const newItems = arrayMove(localItems, currentIndex, currentIndex + 1)
			setLocalItems(newItems)
			onReorder(newItems)
		}
	}

	const activeItem = localItems.find(item => item.id === activeId)
	const activeItemIndex = localItems.findIndex(item => item.id === activeId)

	if (localItems.length === 0) {
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
					items={localItems.map(item => item.id)}
					strategy={verticalListSortingStrategy}
				>
					<motion.div className="space-y-4" layout>
						{localItems.map((item, index) => (
							<SortableItem
								key={item.id}
								id={item.id}
								item={item}
								index={index}
								totalItems={localItems.length}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
							>
								{renderItem(item, index)}
							</SortableItem>
						))}
					</motion.div>
				</SortableContext>

				<DragOverlay>
					{activeItem && activeItemIndex !== -1 ? (
						<div className="bg-white shadow-lg rounded-lg opacity-90 scale-105 p-4">
							{renderItem(activeItem, activeItemIndex)}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}

export default ReorderableList
