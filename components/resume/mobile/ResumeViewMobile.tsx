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

	// Helper function to calculate scale
	const calculateScaleValue = () => {
		if (typeof window === 'undefined') return 0.5 // Default for SSR
		const viewportWidth = window.innerWidth
		const padding = 0 // Increased padding for safety margins
		const availableWidth = viewportWidth - padding
		const basePdfWidth = 793 // Actual PDF width with size-a4 class
		// Scale to 78% of available width to ensure it fits
		return (availableWidth / basePdfWidth) * 0.95
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
		<div className="relative h-screen w-full overflow-hidden">
			{/* PDF Viewer - Dynamically scaled container */}
			<div className="absolute inset-0 overflow-y-auto">
				{/* Centered container */}
				<div className="w-full flex justify-center py-4 pb-[140px]">
					{/* Wrapper with exact scaled dimensions */}
					<div
						className="relative"
						style={{
							width: `${scaledWidth}px`,
							height: `${scaledHeight}px`
						}}
					>
						{/* Scaled PDF - positioned to fill wrapper */}
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
		</div>
	)
}

export default ResumeViewMobile
