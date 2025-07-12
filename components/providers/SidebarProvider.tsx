'use client'

import {createContext, ReactNode, useContext, useState} from 'react'

type CurrentPageType = 'NOTIFICATION' | 'SETTINGS' | null

// Context for sharing sidebar state
const SidebarContext = createContext<{
	isExpanded: boolean,
	currentPage: CurrentPageType,
	setIsExpanded:(expanded: boolean) => void
	setCurrentPage:(currentPage: CurrentPageType) => void
	openNotification: () => void
	openSettings: () => void
	collapseSidebar: () => void
		}>({
			isExpanded: false,
			currentPage: null,
			setIsExpanded: () => {},
			setCurrentPage: () => {},
			openNotification: () => {},
			openSettings: () => {},
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

	const openSettings = () => {
		setIsExpanded(true)
		setCurrentPage('SETTINGS')
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
			openSettings,
			collapseSidebar
		}}>
			{children}
		</SidebarContext.Provider>
	)
}
