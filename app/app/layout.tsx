import {ReactNode} from 'react'
import {SidebarProvider} from '@/components/providers/SidebarProvider'
import AppLayoutContainer from '@/components/clientContainers/AppLayoutContainer'

const AppLayout = ({children}: {children: ReactNode}) => {
	return (
		<SidebarProvider>
			<AppLayoutContainer>
				{children}
			</AppLayoutContainer>
		</SidebarProvider>
	)
}

export default AppLayout
