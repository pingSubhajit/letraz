'use client'

import {useState, useEffect} from 'react'
import ResumeEditor from '@/components/resume/ResumeEditor'
import MobileBottomSheet from './MobileBottomSheet'
import MobileSectionTabs from './MobileSectionTabs'
import {Briefcase, FolderKanban, GraduationCap, Medal, User, Wrench} from 'lucide-react'

interface ResumeViewMobileProps {
	children: React.ReactNode // PDF Viewer content
}

const tabs = [
	{title: 'Profile', icon: User, id: 'profile'},
	{title: 'Education', icon: GraduationCap, id: 'education'},
	{title: 'Experience', icon: Briefcase, id: 'experience'},
	{title: 'Skills', icon: Wrench, id: 'skills'},
	{title: 'Certifications', icon: Medal, id: 'certifications'},
	{title: 'Projects', icon: FolderKanban, id: 'projects'}
]

const ResumeViewMobile = ({children}: ResumeViewMobileProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [activeTab, setActiveTab] = useState(0)

	// Helper function to calculate scale based on both width AND height constraints
	const calculateScaleValue = () => {
		if (typeof window === 'undefined') return 0.5 // Default for SSR

		const basePdfWidth = 793 // Actual PDF width with size-a4 class
		const basePdfHeight = 1122 // Actual PDF height (A4: 297mm)

		// Calculate scale based on viewport width
		const viewportWidth = window.innerWidth
		const scaleByWidth = (viewportWidth / basePdfWidth) * 0.95

		// Calculate scale based on viewport height
		const viewportHeight = window.innerHeight
		const topPadding = 16 // py-4 in pixels
		const bottomPadding = 140 // pb-[140px] in pixels
		const availableHeight = viewportHeight - topPadding - bottomPadding
		const scaleByHeight = (availableHeight / basePdfHeight) * 1.0

		// Use the SMALLER scale to ensure PDF fits within both dimensions
		return Math.min(scaleByWidth, scaleByHeight)
	}

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
	}, [])

	const handleTabChange = (index: number) => {
		console.log('[ResumeViewMobile] Tab changed to:', index)
		setActiveTab(index)
		// Auto-expand when changing tabs
		if (!isExpanded) {
			setIsExpanded(true)
		}
	}	

	// Calculate actual scaled dimensions
	const scaledWidth = 793 * scale  // Actual PDF width with size-a4
	const scaledHeight = 1122 * scale  // Actual PDF height (297mm)

	return (
		<>
			{/* PDF Viewer - Dynamically scaled container with scroll */}
			<div className="relative h-screen w-full overflow-y-auto overflow-x-hidden py-4 pb-[140px] z-10">
				{/* Centered container with scaled dimensions */}
				<div
					className="relative mx-auto"
					style={{
						width: `${scaledWidth}px`,
						height: `${scaledHeight}px`
					}}
				>
					{/* Scaled PDF */}
					<div
						className="absolute top-0 left-0"
						style={{
							width: '793px',  // Actual PDF width with size-a4
							height: '1122px', // Actual PDF height (297mm)
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
				<div className="flex flex-col h-full ">
					{/* Mobile Section Tabs - Always visible */}
					<MobileSectionTabs
						tabs={tabs}
						activeTab={activeTab}
						onTabChange={handleTabChange}
					/>

					{/* Editor Content - Only show when expanded */}
					{isExpanded && (
						<div className="flex-1 overflow-hidden">
							<ResumeEditor
								className="h-full"
								activeTabIndex={activeTab}
								isMobile={true}
							/>
						</div>
					)}
				</div>
			</MobileBottomSheet>
		</>
	)
}

export default ResumeViewMobile
