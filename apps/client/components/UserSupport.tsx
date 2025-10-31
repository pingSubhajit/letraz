'use client'

import {QuestionMarkCircleIcon} from '@heroicons/react/20/solid'
import {Button} from '@/components/ui/button'
import {useSidebar} from '@/components/providers/SidebarProvider'
import {useMobilePanel} from '@/components/providers/MobilePanelProvider'
import {useIsMobile} from '@/components/resume/hooks/useIsMobile'

const UserSupport = () => {
	const {openUserSupport} = useSidebar()
	const {openPanel} = useMobilePanel()
	const isMobile = useIsMobile(1024)

	const handleClick = () => {
		if (isMobile) {
			openPanel('support')
		} else {
			openUserSupport()
		}
	}

	return (
		<Button onClick={handleClick} variant="ghost" className="p-1 aspect-square w-full">
			<QuestionMarkCircleIcon className="fill-primary size-[70%]"/>
		</Button>
	)
}

export default UserSupport

