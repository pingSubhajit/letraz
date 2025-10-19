'use client'

import {createContext, useContext, useEffect, useMemo, useState} from 'react'
import {updateOnboardingStep} from '@/lib/onboarding/actions'

interface BaseResumeProviderProps {
	children: React.ReactNode
}

interface BaseResumeContextValue {
	isBottomSheetExpanded: boolean
	setIsBottomSheetExpanded: (expanded: boolean) => void
}

const BaseResumeContext = createContext<BaseResumeContextValue | undefined>(undefined)

export const useBaseResumeContext = () => {
	const context = useContext(BaseResumeContext)
	if (!context) {
		throw new Error('useBaseResumeContext must be used within BaseResumeProvider')
	}
	return context
}

// Optional hook that returns undefined if not within provider (for components that may or may not be in onboarding flow)
export const useBaseResumeContextOptional = () => {
	return useContext(BaseResumeContext)
}

const BaseResumeProvider = ({children}: BaseResumeProviderProps) => {
	const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false)

	useEffect(() => {
		// Update onboarding step when component mounts
		updateOnboardingStep('resume')
	}, [])

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(() => ({
		isBottomSheetExpanded,
		setIsBottomSheetExpanded
	}), [isBottomSheetExpanded])

	return (
		<BaseResumeContext.Provider value={contextValue}>
			{children}
		</BaseResumeContext.Provider>
	)
}

export default BaseResumeProvider
