'use client'

import {useSidebar} from '@/components/providers/SidebarProvider'
import {Button} from '@/components/ui/button'
import {ChevronLeft} from 'lucide-react'

const UserSupportPanel = () => {
	const {collapseSidebar} = useSidebar()

	return (
		<div className="h-full w-full flex flex-col bg-background">
			{/* Header */}
			<div className="flex items-center justify-between py-4 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={collapseSidebar}
					>
						<ChevronLeft
							className="h-4 w-4"
						/>
					</Button>
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-lg">Help and support</h3>
					</div>
				</div>
			</div>

			{/* Placeholder Content */}
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center text-muted-foreground">
					<p className="text-lg mb-2">Support Panel</p>
					<p className="text-sm">Coming soon...</p>
				</div>
			</div>
		</div>
	)
}

export default UserSupportPanel

