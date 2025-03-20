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
		<div ref={headerParent} className={cn('mb-6 flex items-center justify-between', className)}>
			<div className="flex flex-col gap-1">
				<h2 className="text-lg font-medium min-w-[16rem]">{title}</h2>
				{description && (
					<p className="text-sm max-w-lg opacity-80">{description}</p>
				)}
			</div>

			{!isLoading && showAddButton && (
				<Button
					onClick={onAddNew}
					variant="outline"
					size="sm"
					disabled={isDisabled}
				>
					<Plus className="h-4 w-4 mr-2" />
					{addButtonText}
				</Button>
			)}
		</div>
	)
}

export default EditorHeader
