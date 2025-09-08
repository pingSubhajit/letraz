'use client'

import React, {useRef} from 'react'
import {Button} from '@/components/ui/button'
import {Search} from 'lucide-react'
import {DropdownMenuShortcut} from '@/components/ui/dropdown-menu'
import {DocsSearchDialogRef} from '@/components/DocsSearchDialog'
import {DocPage} from '@/lib/basehub'

interface DocsSearchButtonProps {
	allPages: DocPage[]
}

export const DocsSearchButton = ({allPages}: DocsSearchButtonProps) => {
	const searchDialogRef = useRef<{openDialog: () => void}>(null)

	const handleClick = () => {
		searchDialogRef.current?.openDialog()
	}

	return (
		<>
			<Button
				variant="secondary"
				className="w-full text-muted-foreground gap-1.5 justify-between"
				onClick={handleClick}
			>
				<div className="flex items-center gap-1.5">
					<Search className="w-4 aspect-square" />
					Search documentation
				</div>

				<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
			</Button>

			<DocsSearchDialogRef
				ref={searchDialogRef}
				allPages={allPages}
			/>
		</>
	)
}
