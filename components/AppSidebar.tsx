import AppSidebarContainer from '@/components/clientContainers/AppSidebarContainer'
import {UserButton} from '@clerk/nextjs'
import {Button} from '@/components/ui/button'
import Link from 'next/link'
import {Cog6ToothIcon} from '@heroicons/react/20/solid'

const AppSidebar = () => {
	return (
		<AppSidebarContainer className="h-full px-4 pt-24 pb-8 flex flex-col items-center justify-between bg-primary-foreground/90">
			<Link href="/app"><img src='/logo_mono_rotated.svg' alt="Letraz logo" className=""/></Link>
			<div className="flex flex-col items-center justify-end gap-4">
				<Link href="/app/settings">
					<Button variant="ghost" className="p-1 aspect-square w-full">
						<Cog6ToothIcon className="fill-primary size-[70%]"/>
					</Button>
				</Link>
				<UserButton appearance={{elements: {button: 'w-full'}}}/>
			</div>
		</AppSidebarContainer>
	)
}

export default AppSidebar
