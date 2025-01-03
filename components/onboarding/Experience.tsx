'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import {z} from 'zod'
import {useState} from 'react'
import {motion} from 'framer-motion'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import ExperienceForm, {experienceFormSchema} from '@/components/onboarding/ExperienceForm'
import {experiences} from '@/db/schema'
import {months} from '@/constants'
import {X} from 'lucide-react'
import {deleteExperienceFromDB} from '@/lib/experience.methods'
import {toast} from 'sonner'
import PopConfirm from '@/components/ui/pop-confirm'

const Experience = ({allExperiences}: { allExperiences: (typeof experiences.$inferSelect)[] }) => {
	const [currentExperiences, setCurrentExperiences] = useState<z.infer<typeof experienceFormSchema>[]>(allExperiences.map(experience => ({
		id: experience.id,
		companyName: experience.companyName as string | undefined,
		country: experience.country as string | undefined,
		jobTitle: experience.jobTitle as string | undefined,
		city: experience.city as string | undefined,
		startedFromMonth: experience.startedFromMonth ? months[experience.startedFromMonth - 1] : undefined,
		startedFromYear: experience.startedFromYear ? experience.startedFromYear.toString() : undefined,
		finishedAtMonth: experience.finishedAtMonth ? months[experience.finishedAtMonth - 1] : undefined,
		finishedAtYear: experience.finishedAtYear ? experience.finishedAtYear.toString() : undefined,
		current: experience.current as boolean | undefined,
		description: experience.description as string | undefined
	})))
	const [parent] = useAutoAnimate()

	const handleDeleteExperience = async (index: number) => {
		const experienceToDelete = currentExperiences[index]
		if (!experienceToDelete.id) {
			toast.error('Cannot delete experience without an ID')
			return
		}

		try {
			const result = await deleteExperienceFromDB(experienceToDelete.id)
			if (result && result.length > 0) {
				setCurrentExperiences(prev => prev.filter((_, i) => i !== index))
				toast.success('Experience deleted successfully')
			} else {
				throw new Error('Failed to delete experience')
			}
		} catch (error) {
			toast.error('Failed to delete experience. Please try again.')
		}
	}

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 mb-40 pt-16">
			{/* HEADING TEXT */}
			<div>
				<TextAnimate
					text="What about"
					type="calmInUp"
					className="text-5xl leading-snug"
					{...({} as any)}
					// Framer-motion types are broken as of 22/10/2024
				/>
				<TextAnimate
					text="your past experiences"
					type="calmInUp"
					className="text-5xl leading-snug"
					{...({} as any)}
					// Framer-motion types are broken as of 22/10/2024
				/>
			</div>

			{/* FORM */}
			<ExperienceForm experiences={currentExperiences} setExperiences={setCurrentExperiences} />

			{/* EXPERIENCES */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: currentExperiences.length > 0 ? 1 : 0, y: currentExperiences.length > 0 ? '-50%' : '-30%'}}
				transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="absolute h-[512px] w-[40%] right-16 top-1/2 -translate-y-1/2 overflow-auto"
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
			>
				<h3 className="text-center text-3xl font-medium">Experiences</h3>

				<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
					{currentExperiences.map(
						(experience, index) => (
							<li key={experience.id || index} className="bg-white rounded-xl py-4 px-6 shadow-lg relative">
								<PopConfirm
									triggerElement={
										<button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
											<X size={16} />
										</button>
									}
									message="Are you sure you want to delete this experience?"
									onYes={() => handleDeleteExperience(index)}
								/>
								<p className="truncate font-medium text-xl">
									{experience.jobTitle && experience.jobTitle + ' '}
									{experience.jobTitle && 'in'} {experience.companyName}
								</p>
								<p className="mt-1 text-sm">
									{experience.startedFromMonth && experience.startedFromYear && 'From '}
									{experience.startedFromMonth} {experience.startedFromYear}

									{experience.finishedAtMonth && experience.finishedAtYear && ' until '}
									{experience.finishedAtMonth} {experience.finishedAtYear}
								</p>
							</li>
						)
					)}
				</ul>
			</motion.div>
		</div>
	)
}

export default Experience
