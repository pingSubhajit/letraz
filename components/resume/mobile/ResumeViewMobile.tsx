'use client'

import {useState} from 'react'
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

	const handleTabChange = (index: number) => {
		console.log('[ResumeViewMobile] Tab changed to:', index)
		setActiveTab(index)
		// Auto-expand when changing tabs
		if (!isExpanded) {
			setIsExpanded(true)
		}
	}

	return (
		<div className="relative h-screen w-full overflow-hidden">
			{/* PDF Viewer - Fixed dimensions to prevent content shifting */}
			<div className="absolute inset-0 overflow-auto bg-neutral-100 pb-40 ">
				<div className="w-full flex justify-center px-2 py-4">
					{/* Fixed container with A4 dimensions in pixels (595x842px) */}
					<div className="relative" style={{ width: '895px', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
						<div className="shadow-none border-0">
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
