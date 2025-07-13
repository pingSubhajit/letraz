'use client'

import {cn} from '@/lib/utils'
import EducationEditor from '@/components/resume/editors/EducationEditor'
import ExperienceEditor from '@/components/resume/editors/ExperienceEditor'
import PersonalDetailsEditor from './editors/PersonalDetailsEditor'
import SkillsEditor from '@/components/resume/editors/SkillsEditor'
import {Resume} from '@/lib/resume/types'
import {ExpandableTabs} from '@/components/ui/expandable-tabs'
import {Briefcase, FolderKanban, GraduationCap, User, Wrench} from 'lucide-react'
import {useState} from 'react'

const ResumeEditor = ({resume, className}: {resume: Resume, className?: string}) => {
	const [activeTab, setActiveTab] = useState<number>(0) // Default to Education (index 0)

	const tabs = [
		{title: 'Profile', icon: User},
		{title: 'Education', icon: GraduationCap},
		{title: 'Experience', icon: Briefcase},
		{title: 'Skills', icon: Wrench},
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
				{/* Keep all editors mounted, but only display the active one */}
				<div className={activeTab === 0 ? 'block' : 'hidden'}>
					<PersonalDetailsEditor />
				</div>
				<div className={activeTab === 1 ? 'block' : 'hidden'}>
					<EducationEditor />
				</div>
				<div className={activeTab === 2 ? 'block' : 'hidden'}>
					<ExperienceEditor />
				</div>
				<div className={activeTab === 3 ? 'block' : 'hidden'}>
					<SkillsEditor />
				</div>
				<div className={activeTab === 4 ? 'block' : 'hidden'}>
					<div className="p-4">
						<p className="text-center text-muted-foreground">Project editor is coming soon</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ResumeEditor
