'use client'

import {cn} from '@/lib/utils'
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Award, Briefcase, GraduationCap, User, Medal} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import {useState} from 'react'
import EducationEditor from '@/components/resume/editors/EducationEditor'
import ExperienceEditor from '@/components/resume/editors/ExperienceEditor'
import CertificationEditor from '@/components/resume/editors/CertificationEditor'
import PersonalDetailsEditor from './editors/PersonalDetailsEditor'

const ResumeEditor = ({className}: {className?: string}) => {
	const [activeTab, setActiveTab] = useState('education')

	const renderTabContent = () => {
		switch (activeTab) {
		case 'education':
			return (
				<motion.div
					key="education"
					initial={{opacity: 0, y: 10}}
					animate={{opacity: 1, y: 0}}
					exit={{opacity: 0, y: -10}}
					transition={{duration: 0.2, ease: 'easeInOut'}}
					className="mt-6"
				>
					<EducationEditor />
				</motion.div>
			)
		case 'experience':
			return (
				<motion.div
					key="experience"
					initial={{opacity: 0, y: 10}}
					animate={{opacity: 1, y: 0}}
					exit={{opacity: 0, y: -10}}
					transition={{duration: 0.2, ease: 'easeInOut'}}
					className="mt-6"
				>
					<ExperienceEditor />
				</motion.div>
			)
		case 'certifications':
			return (
				<motion.div
					key="certifications"
					initial={{opacity: 0, y: 10}}
					animate={{opacity: 1, y: 0}}
					exit={{opacity: 0, y: -10}}
					transition={{duration: 0.2, ease: 'easeInOut'}}
					className="mt-6"
				>
					<CertificationEditor />
				</motion.div>
			)
		case 'skills':
			return (
				<motion.div
					key="skills"
					initial={{opacity: 0, y: 10}}
					animate={{opacity: 1, y: 0}}
					exit={{opacity: 0, y: -10}}
					transition={{duration: 0.2, ease: 'easeInOut'}}
					className="mt-6"
				>
					<div className="text-center py-8">
						<div className="text-lg font-medium mb-2">Skills editor coming soon...</div>
						<div className="text-sm">We're working on bringing you an amazing skills editing experience.</div>
					</div>
				</motion.div>
			)
		case 'personal':
			return (
				<motion.div
					key="personal"
					initial={{opacity: 0, y: 10}}
					animate={{opacity: 1, y: 0}}
					exit={{opacity: 0, y: -10}}
					transition={{duration: 0.2, ease: 'easeInOut'}}
					className="mt-6"
				>
					<PersonalDetailsEditor />
				</motion.div>
			)
		default:
			return null
		}
	}

	return (
		<div className={cn('p-6', className)}>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-5 bg-neutral-100 p-1">
					<TabsTrigger
						value="personal"
						className="relative font-medium text-neutral-600 hover:text-neutral-800 data-[state=active]:bg-white data-[state=active]:text-flame-700 data-[state=active]:shadow-md data-[state=active]:shadow-neutral-200/50 data-[state=active]:border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/60 flex items-center gap-2"
					>
						<User className="w-4 h-4" />
						Personal Info
					</TabsTrigger>
					<TabsTrigger
						value="education"
						className="relative font-medium text-neutral-600 hover:text-neutral-800 data-[state=active]:bg-white data-[state=active]:text-flame-700 data-[state=active]:shadow-md data-[state=active]:shadow-neutral-200/50 data-[state=active]:border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/60 flex items-center gap-2"
					>
						<GraduationCap className="w-4 h-4" />
						Education
					</TabsTrigger>
					<TabsTrigger
						value="experience"
						className="relative font-medium text-neutral-600 hover:text-neutral-800 data-[state=active]:bg-white data-[state=active]:text-flame-700 data-[state=active]:shadow-md data-[state=active]:shadow-neutral-200/50 data-[state=active]:border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/60 flex items-center gap-2"
					>
						<Briefcase className="w-4 h-4" />
						Experience
					</TabsTrigger>
					<TabsTrigger
						value="certifications"
						className="relative font-medium text-neutral-600 hover:text-neutral-800 data-[state=active]:bg-white data-[state=active]:text-flame-700 data-[state=active]:shadow-md data-[state=active]:shadow-neutral-200/50 data-[state=active]:border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/60 flex items-center gap-2"
					>
						<Medal className="w-4 h-4" />
						Certifications
					</TabsTrigger>
					<TabsTrigger
						value="skills"
						className="relative font-medium text-neutral-600 hover:text-neutral-800 data-[state=active]:bg-white data-[state=active]:text-flame-700 data-[state=active]:shadow-md data-[state=active]:shadow-neutral-200/50 data-[state=active]:border-0 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/60 flex items-center gap-2"
					>
						<Award className="w-4 h-4" />
						Skills
					</TabsTrigger>
				</TabsList>

				<div className="mt-8">
					<AnimatePresence mode="wait">
						{renderTabContent()}
					</AnimatePresence>
				</div>
			</Tabs>
		</div>
	)
}

export default ResumeEditor
