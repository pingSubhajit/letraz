'use client'

import {useAutoAnimate} from '@formkit/auto-animate/react'
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
	const [headerParent] = useAutoAnimate()

	return (
		<div ref={headerParent} className={cn('mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3', className)}>
			<div className="flex flex-col gap-1">
				<h2 className="text-base sm:text-lg font-medium">{title}</h2>
				{description && (
					<p className="text-xs sm:text-sm max-w-lg opacity-80">{description}</p>
				)}
			</div>

			{!isLoading && showAddButton && (
				<Button
					onClick={onAddNew}
					variant="outline"
					size="sm"
					disabled={isDisabled}
					className="w-full sm:w-auto"
				>
					<Plus className="h-4 w-4 mr-2" />
					{addButtonText}
				</Button>
			)}
		</div>
	)
}

export default EditorHeader
