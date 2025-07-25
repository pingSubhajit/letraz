'use client'

import {cn} from '@/lib/utils'
import CertificationEditor from '@/components/resume/editors/CertificationEditor'
import EducationEditor from '@/components/resume/editors/EducationEditor'
import ExperienceEditor from '@/components/resume/editors/ExperienceEditor'
import PersonalDetailsEditor from './editors/PersonalDetailsEditor'
import SkillsEditor from '@/components/resume/editors/SkillsEditor'
import {ExpandableTabs} from '@/components/ui/expandable-tabs'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Briefcase, FolderKanban, GraduationCap, Medal, User, Wrench} from 'lucide-react'
import {useState} from 'react'
import {motion} from 'motion/react'
import ProjectEditor from '@/components/resume/editors/ProjectEditor'
import DEFAULT_SLIDE_ANIMATION from '@/components/animations/DefaultSlide'

const ResumeEditor = ({className}: {className?: string}) => {
	const [activeTab, setActiveTab] = useState<number>(0) // Default to Profile (index 0)
	const [activeTabId, setActiveTabId] = useState<string>('profile') // For traditional tabs

	// Feature flag to switch between new and old tab designs
	const useNewTabDesign = process.env.NEXT_PUBLIC_RESUME_EDITOR_TABS_NEW_DESIGN_ENABLED === 'true'

	const tabs = [
		{title: 'Profile', icon: User, id: 'profile'},
		{title: 'Education', icon: GraduationCap, id: 'education'},
		{title: 'Experience', icon: Briefcase, id: 'experience'},
		{title: 'Skills', icon: Wrench, id: 'skills'},
		{title: 'Certifications', icon: Medal, id: 'certifications'},
		{title: 'Projects', icon: FolderKanban, id: 'projects'}
	]

	// Handle tab changes, ignoring null values
	const handleTabChange = (index: number | null) => {
		if (index !== null) {
			setActiveTab(index)
		}
	}

	// Render editor content based on current tab
	const renderEditorContent = () => {
		const tabIndex = useNewTabDesign ? activeTab : tabs.findIndex(tab => tab.id === activeTabId)

		switch (tabIndex) {
		case 0: return <motion.div key="profile" {...DEFAULT_SLIDE_ANIMATION}><PersonalDetailsEditor isTabSwitch={true} /></motion.div>
		case 1: return <motion.div key="education" {...DEFAULT_SLIDE_ANIMATION}><EducationEditor isTabSwitch={true} /></motion.div>
		case 2: return <motion.div key="experience" {...DEFAULT_SLIDE_ANIMATION}><ExperienceEditor isTabSwitch={true} /></motion.div>
		case 3: return <motion.div key="skill" {...DEFAULT_SLIDE_ANIMATION}><SkillsEditor isTabSwitch={true} /></motion.div>
		case 4: return <motion.div key="certification" {...DEFAULT_SLIDE_ANIMATION}><CertificationEditor isTabSwitch={true} /></motion.div>
		case 5: return <motion.div key="project" {...DEFAULT_SLIDE_ANIMATION}><ProjectEditor isTabSwitch={true} /></motion.div>
		default: return <motion.div key="profile" {...DEFAULT_SLIDE_ANIMATION}><PersonalDetailsEditor isTabSwitch={true} /></motion.div>
		}
	}

	return (
		<div className={cn('p-6', className)}>
			{useNewTabDesign ? (
				// New expandable tabs design
				<>
					<ExpandableTabs
						tabs={tabs}
						onChange={handleTabChange}
						className="mb-6"
						collapseOnOutsideClick={false}
					/>
					<div className="mt-6">
						{renderEditorContent()}
					</div>
				</>
			) : (
				// Traditional tabs design
				<Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
					<TabsList className="grid w-full grid-cols-6 h-12 p-1 rounded-xl">
						{tabs.map((tab) => {
							const IconComponent = tab.icon
							return (
								<TabsTrigger
									key={tab.id}
									value={tab.id}
									className="relative font-medium text-neutral-600 hover:text-neutral-800 data-[state=active]:bg-white data-[state=active]:text-flame-700 data-[state=active]:shadow-md data-[state=active]:shadow-neutral-200/50 data-[state=active]:border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/60 flex items-center gap-2"
								>
									<IconComponent className="h-4 w-4 shrink-0" />
									<span className="hidden sm:inline truncate">{tab.title}</span>
								</TabsTrigger>
							)
						})}
					</TabsList>
					{tabs.map((tab) => (
						<TabsContent key={tab.id} value={tab.id} className="mt-6">
							{renderEditorContent()}
						</TabsContent>
					))}
				</Tabs>
			)}
		</div>
	)
}

export default ResumeEditor
