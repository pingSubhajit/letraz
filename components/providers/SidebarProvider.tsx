'use client'

import {createContext, ReactNode, useContext, useState} from 'react'

type CurrentPageType = 'NOTIFICATION' | 'USER_SUPPORT' | null

// Context for sharing sidebar state
const SidebarContext = createContext<{
	isExpanded: boolean,
	currentPage: CurrentPageType,
	setIsExpanded:(expanded: boolean) => void
	setCurrentPage:(currentPage: CurrentPageType) => void
	openNotification: () => void
	openUserSupport: () => void
	collapseSidebar: () => void
		}>({
			isExpanded: false,
			currentPage: null,
			setIsExpanded: () => {},
			setCurrentPage: () => {},
			openNotification: () => {},
			openUserSupport: () => {},
			collapseSidebar: () => {}
		})

export const useSidebar = () => useContext(SidebarContext)

export const SidebarProvider = ({children}: {children: ReactNode}) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [currentPage, setCurrentPage] = useState<CurrentPageType>(null)

	const openNotification = () => {
		setIsExpanded(true)
		setCurrentPage('NOTIFICATION')
	}

	const openUserSupport = () => {
		setIsExpanded(true)
		setCurrentPage('USER_SUPPORT')
	}

	const collapseSidebar = () => {
		setIsExpanded(false)
		setCurrentPage(null)
	}

	return (
		<SidebarContext.Provider value={{
			isExpanded,
			setIsExpanded,
			currentPage,
			setCurrentPage,
			openNotification,
			openUserSupport,
			collapseSidebar
		}}>
			{children}
		</SidebarContext.Provider>
	)
}
