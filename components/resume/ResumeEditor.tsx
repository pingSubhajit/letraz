'use client'

import {cn} from '@/lib/utils'
import CertificationEditor from '@/components/resume/editors/CertificationEditor'
import EducationEditor from '@/components/resume/editors/EducationEditor'
import ExperienceEditor from '@/components/resume/editors/ExperienceEditor'

import PersonalDetailsEditor from './editors/PersonalDetailsEditor'
import SkillsEditor from '@/components/resume/editors/SkillsEditor'
import {ExpandableTabs} from '@/components/ui/expandable-tabs'
import {Briefcase, FolderKanban, GraduationCap, Medal, User, Wrench} from 'lucide-react'
import {useState} from 'react'

const ResumeEditor = ({className}: {className?: string}) => {
	const [activeTab, setActiveTab] = useState<number>(0) // Default to Education (index 0)

	const tabs = [
		{title: 'Profile', icon: User},
		{title: 'Education', icon: GraduationCap},
		{title: 'Experience', icon: Briefcase},
		{title: 'Skills', icon: Wrench},
		{title: 'Certifications', icon: Medal},
		{title: 'Projects', icon: FolderKanban}
	]

	// Handle tab changes, ignoring null values
	const handleTabChange = (index: number | null) => {
		if (index !== null) {
			setActiveTab(index)
		}
	}

	return (
		<div className={cn('p-6', className)}>

			<ExpandableTabs
				tabs={tabs}
				onChange={handleTabChange}
				className="mb-6"
				collapseOnOutsideClick={false}
			/>

			<div className="mt-6">
				{/* Conditionally render only the active editor component */}
				{activeTab === 0 && <PersonalDetailsEditor />}
				{activeTab === 1 && <EducationEditor />}
				{activeTab === 2 && <ExperienceEditor />}
				{activeTab === 3 && <SkillsEditor />}
				{activeTab === 4 && <CertificationEditor />}
				{activeTab === 5 && (
					<div className="p-4">
						<p className="text-center text-muted-foreground">Project editor is coming soon</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default ResumeEditor
