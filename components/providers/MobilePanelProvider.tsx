'use client'

import {createContext, useContext, useState, ReactNode, useCallback} from 'react'

type PanelType = 'notifications' | 'support' | null

interface MobilePanelContextType {
	activePanel: PanelType
	openPanel: (panel: PanelType) => void
	closePanel: () => void
	isOpen: boolean
}

const MobilePanelContext = createContext<MobilePanelContextType | undefined>(undefined)

export const useMobilePanel = () => {
	const context = useContext(MobilePanelContext)
	if (!context) {
		throw new Error('useMobilePanel must be used within MobilePanelProvider')
	}
	return context
}

interface MobilePanelProviderProps {
	children: ReactNode
}

export const MobilePanelProvider = ({children}: MobilePanelProviderProps) => {
	const [activePanel, setActivePanel] = useState<PanelType>(null)

	const openPanel = useCallback((panel: PanelType) => {
		// Close any existing panel first with a small delay for smooth transition
		if (activePanel) {
			setActivePanel(null)
			setTimeout(() => setActivePanel(panel), 150)
		} else {
			setActivePanel(panel)
		}
	}, [activePanel])

	const closePanel = useCallback(() => {
		setActivePanel(null)
	}, [])

	const isOpen = activePanel !== null

	return (
		<MobilePanelContext.Provider value={{activePanel, openPanel, closePanel, isOpen}}>
			{children}
		</MobilePanelContext.Provider>
	)
}
