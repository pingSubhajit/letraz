'use client'

import {Button} from '@/components/ui/button'
import {Pencil, X, Loader2} from 'lucide-react'
import PopConfirm from '@/components/ui/pop-confirm'
import {ReactNode} from 'react'

interface ItemCardProps {
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  id: string
  deletingId: string | null
  children: ReactNode
  className?: string
}

const ItemCard = ({
	onEdit,
	onDelete,
	isDeleting,
	id,
	deletingId,
	children,
	className = ''
}: ItemCardProps) => {
	const isThisItemDeleting = isDeleting && deletingId === id

	return (
		<div className={`flex items-start justify-between p-4 rounded-lg border bg-card ${className}`}>
			<div className="space-y-1">
				{children}
			</div>
			<div className="flex gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={onEdit}
					disabled={isDeleting}
				>
					<span className="sr-only">Edit item</span>
					<Pencil className="h-4 w-4" />
				</Button>
				<PopConfirm
					triggerElement={
						<Button variant="ghost" size="icon" disabled={isDeleting}>
							{isThisItemDeleting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<X className="h-4 w-4" />
							)}
							<span className="sr-only">Delete item</span>
						</Button>
					}
					message="Are you sure you want to delete this item?"
					onYes={onDelete}
				/>
			</div>
		</div>
	)
}

export default ItemCard
