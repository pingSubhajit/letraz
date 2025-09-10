import {ReactNode} from 'react'
import type {Metadata} from 'next'
import {SidebarProvider} from '@/components/providers/SidebarProvider'
import AppLayoutContainer from '@/components/clientContainers/AppLayoutContainer'

export const metadata: Metadata = {
	title: {
		default: 'Letraz — App',
		template: '%s — Letraz'
	},
	description: 'Your Letraz application workspace to craft and manage tailored resumes.'
}

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
