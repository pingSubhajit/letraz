'use client'

import {cn} from '@/lib/utils'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import EducationEditor from '@/components/resume/editors/EducationEditor'
import ExperienceEditor from '@/components/resume/editors/ExperienceEditor'
import SkillsEditor from '@/components/resume/editors/SkillsEditor'
import {Resume} from '@/lib/resume/types'

const ResumeEditor = ({resume, className}: {resume: Resume, className?: string}) => {
	return (
		<div className={cn('p-6', className)}>
			<Tabs defaultValue="education" className="w-full">
				<TabsList className="grid w-full grid-cols-3 bg-neutral-100 p-1">
					<TabsTrigger
						value="education"
						className="data-[state=active]:bg-white"
					>
						Education
					</TabsTrigger>
					<TabsTrigger
						value="experience"
						className="data-[state=active]:bg-white"
					>
						Experience
					</TabsTrigger>
					<TabsTrigger
						value="skills"
						className="data-[state=active]:bg-white"
					>
						Skills
					</TabsTrigger>
				</TabsList>
				<TabsContent value="education">
					<EducationEditor className="mt-6" />
				</TabsContent>
				<TabsContent value="experience">
					<ExperienceEditor className="mt-6" />
				</TabsContent>
				<TabsContent value="skills">
					<SkillsEditor className="mt-6" />
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default ResumeEditor
