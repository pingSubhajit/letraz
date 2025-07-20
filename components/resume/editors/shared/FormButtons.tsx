'use client'

import {Button} from '@/components/ui/button'
import {Loader2} from 'lucide-react'
import ButtonGroup from '@/components/ui/button-group'

interface FormButtonsProps {
  onCancel: () => void
  isSubmitting: boolean
  isEditing: boolean
  submitLabel?: string
  cancelLabel?: string
  editingSubmitLabel?: string
  addingSubmitLabel?: string
  className?: string
  disabled?: boolean
}

const FormButtons = ({
	onCancel,
	isSubmitting,
	isEditing,
	submitLabel,
	cancelLabel = 'Cancel',
	editingSubmitLabel = 'Update',
	addingSubmitLabel = 'Add',
	className,
	disabled = false
}: FormButtonsProps) => {
	// If submitLabel is provided, use it. Otherwise, use appropriate label based on isEditing
	const effectiveSubmitLabel = submitLabel || (isEditing ? editingSubmitLabel : addingSubmitLabel)

	return (
		<ButtonGroup className={`justify-end mt-4 ${className || ''}`}>
			<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
				{cancelLabel}
			</Button>
			<Button type="submit" disabled={isSubmitting || disabled}>
				{isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						{isEditing ? 'Updating...' : 'Adding...'}
					</>
				) : (
					<>{effectiveSubmitLabel}</>
				)}
			</Button>
		</ButtonGroup>
	)
}

export default FormButtons
