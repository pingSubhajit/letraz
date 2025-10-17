'use client'

import {useState, useEffect, useCallback, useMemo} from 'react'
import ResumeEditor from '@/components/resume/ResumeEditor'
import MobileBottomSheet from './MobileBottomSheet'
import MobileSectionTabs from './MobileSectionTabs'
import {Briefcase, FolderKanban, GraduationCap, Medal, User, Wrench} from 'lucide-react'
import {PDF_DIMENSIONS, MOBILE_LAYOUT, SCALE_FACTORS} from '@/lib/constants'

interface ResumeViewMobileProps {
	/** PDF viewer content to display */
	children: React.ReactNode
}

const tabs = [
	{title: 'Profile', icon: User, id: 'profile'},
	{title: 'Education', icon: GraduationCap, id: 'education'},
	{title: 'Experience', icon: Briefcase, id: 'experience'},
	{title: 'Skills', icon: Wrench, id: 'skills'},
	{title: 'Certifications', icon: Medal, id: 'certifications'},
	{title: 'Projects', icon: FolderKanban, id: 'projects'}
]

/**
 * Mobile resume view component with responsive PDF scaling and bottom sheet editor
 *
 * Features:
 * - Dual-constraint PDF scaling (width AND height aware)
 * - Dynamic viewport-based sizing
 * - Bottom sheet with tabbed section editor
 * - Auto-expand on tab change
 *
 * @param children - PDF viewer content to display
 * @returns Mobile layout with scaled PDF and bottom sheet editor
 */
const ResumeViewMobile = ({children}: ResumeViewMobileProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [activeTab, setActiveTab] = useState(0)

	/**
	 * Calculate optimal PDF scale based on both viewport width AND height constraints
	 * Uses the smaller of the two scales to ensure the PDF fits within both dimensions
	 *
	 * @returns Scale factor between 0 and 1
	 */
	const calculateScaleValue = useCallback(() => {
		if (typeof window === 'undefined') return 0.5 // Default for SSR

		// Calculate scale based on viewport width
		const viewportWidth = window.innerWidth
		const scaleByWidth = (viewportWidth / PDF_DIMENSIONS.WIDTH) * SCALE_FACTORS.WIDTH_MULTIPLIER

		// Calculate scale based on viewport height
		const viewportHeight = window.innerHeight
		const availableHeight = viewportHeight - MOBILE_LAYOUT.TOP_PADDING - MOBILE_LAYOUT.BOTTOM_PADDING
		const scaleByHeight = (availableHeight / PDF_DIMENSIONS.HEIGHT) * SCALE_FACTORS.HEIGHT_MULTIPLIER

		// Use the SMALLER scale to ensure PDF fits within both dimensions
		return Math.min(scaleByWidth, scaleByHeight)
	}, [])

	// Initialize scale with actual value to prevent hydration mismatch
	const [scale, setScale] = useState(() => calculateScaleValue())

	// Calculate dynamic scale based on viewport width
	useEffect(() => {
		const handleResize = () => {
			setScale(calculateScaleValue())
		}

		// Set initial scale on mount
		handleResize()

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [calculateScaleValue])

	/**
	 * Handle tab navigation with auto-expand behavior
	 * Automatically expands the bottom sheet when user changes tabs
	 */
	const handleTabChange = useCallback((index: number) => {
		setActiveTab(index)
		// Auto-expand when changing tabs
		if (!isExpanded) {
			setIsExpanded(true)
		}
	}, [isExpanded])

	// Memoize scaled dimensions to avoid recalculation on every render
	const scaledDimensions = useMemo(() => ({
		width: PDF_DIMENSIONS.WIDTH * scale,
		height: PDF_DIMENSIONS.HEIGHT * scale
	}), [scale])

	return (
		<>
			{/* PDF Viewer - Dynamically scaled container with scroll */}
			<div className="relative h-screen w-full overflow-y-auto overflow-x-hidden py-4 pb-[140px] z-10">
				{/* Centered container with scaled dimensions */}
				<div
					className="relative mx-auto"
					style={{
						width: `${scaledDimensions.width}px`,
						height: `${scaledDimensions.height}px`
					}}
				>
					{/* Scaled PDF */}
					<div
						className="absolute top-0 left-0"
						style={{
							width: `${PDF_DIMENSIONS.WIDTH}px`,
							height: `${PDF_DIMENSIONS.HEIGHT}px`,
							transform: `scale(${scale})`,
							transformOrigin: 'top left'
						}}
					>
						{children}
					</div>
				</div>
			</div>

			{/* Bottom Sheet with Tabs and Editor */}
			<MobileBottomSheet
				isExpanded={isExpanded}
				onExpandChange={setIsExpanded}
			>
				{/* Mobile Section Tabs - Always visible, horizontally scrollable */}
				<MobileSectionTabs
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>

				{/* Editor Content - Scrollable vertically when expanded */}
				{isExpanded && (
					<div className="flex-1 overflow-y-auto">
						<ResumeEditor
							className="h-full"
							activeTabIndex={activeTab}
							isMobile={true}
						/>
					</div>
				)}
			</MobileBottomSheet>
		</>
	)
}

export default ResumeViewMobile
