'use client'

import {QuestionMarkCircleIcon} from '@heroicons/react/20/solid'
import {Button} from '@/components/ui/button'
import {useSidebar} from '@/components/providers/SidebarProvider'

const UserSupport = () => {
	const {openUserSupport} = useSidebar()

	return (
		<Button onClick={openUserSupport} variant="ghost" className="p-1 aspect-square w-full">
			<QuestionMarkCircleIcon className="fill-primary size-[70%]"/>
		</Button>
	)
}

export default UserSupport

