'use client'

import {Button} from '@/components/ui/button'
import {Plus} from 'lucide-react'
import {cn} from '@/lib/utils'

interface EditorHeaderProps {
  title: string
  description?: string
  showAddButton?: boolean
  onAddNew?: () => void
  isLoading?: boolean
  itemsCount?: number
  className?: string
  addButtonText?: string
  isDisabled?: boolean
}

const EditorHeader = ({
	title,
	description,
	showAddButton = false,
	onAddNew,
	isLoading = false,
	itemsCount,
	className,
	addButtonText = 'Add New',
	isDisabled = false
}: EditorHeaderProps) => {
	// const [headerParent] = useAutoAnimate()

	return (
		<div className={cn('mb-4 lg:mb-4 2xl:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-2 2xl:gap-3', className)}>
			<div className="flex flex-col gap-0.5 lg:gap-0.5 2xl:gap-1 min-w-0 flex-1">
				<h2 className="text-sm sm:text-base lg:text-[15px] 2xl:text-lg font-medium whitespace-nowrap">{title}</h2>
				{description && (
					<p className="text-xs lg:text-xs 2xl:text-sm max-w-lg opacity-80">{description}</p>
				)}
			</div>

			{!isLoading && showAddButton && (
				<Button
					onClick={onAddNew}
					variant="outline"
					size="sm"
					disabled={isDisabled}
					className="w-full sm:w-auto text-xs lg:text-xs 2xl:text-sm"
				>
					<Plus className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5 2xl:h-4 2xl:w-4 mr-1.5 lg:mr-1.5 2xl:mr-2" />
					{addButtonText}
				</Button>
			)}
		</div>
	)
}

export default EditorHeader
