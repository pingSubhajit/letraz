'use client'

import {useEffect, useState} from 'react'

/**
 * Hook to detect if the current viewport is mobile size
 * @param breakpoint - The max width in pixels to consider as mobile (default: 768)
 * @returns boolean indicating if the viewport is mobile size
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
	// Initialize with actual value if window is available (client-side)
	// This prevents hydration mismatch and flash of wrong layout
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window !== 'undefined') {
			const mobile = window.innerWidth < breakpoint
			return mobile
		}
		// Default to false for SSR
		return false
	})

	useEffect(() => {
		// Check function
		const checkMobile = () => {
			const mobile = window.innerWidth < breakpoint
			setIsMobile(mobile)
		}

		// Double-check on mount (in case SSR defaulted to false)
		checkMobile()

		// Add event listener for window resize
		window.addEventListener('resize', checkMobile)

		// Cleanup
		return () => window.removeEventListener('resize', checkMobile)
	}, [breakpoint])

	return isMobile
}
