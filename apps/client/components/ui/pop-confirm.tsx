'use client'

import React, {useState} from 'react'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Button} from '@/components/ui/button'

interface PopConfirmProps {
	triggerElement: React.ReactNode
	message: string
	onYes: () => void
}

const PopConfirm = ({triggerElement, message, onYes}: PopConfirmProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const handleYes = () => {
		onYes()
		setIsOpen(false)
	}

	const handleNo = () => {
		setIsOpen(false)
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild onClick={() => {
				setIsOpen(true)
			}}>
				{triggerElement}
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Confirm Action</h4>
						<p className="text-sm text-muted-foreground">{message}</p>
					</div>
					<div className="flex justify-end space-x-2">
						<Button variant="outline" size="sm" onClick={handleNo}>
							No
						</Button>
						<Button size="sm" onClick={handleYes}>
							Yes
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}

export default PopConfirm
