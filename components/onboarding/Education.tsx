'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import EducationForm, {educationFormSchema} from '@/components/onboarding/EducationForm'
import {z} from 'zod'
import {useState} from 'react'
import {motion} from 'motion/react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {educations} from '@/db/schema'
import {months} from '@/constants'
import {X} from 'lucide-react'
import PopConfirm from '@/components/ui/pop-confirm'
import {toast} from 'sonner'
import {deleteEducationFromDB} from '@/lib/education.methods'

const Education = ({allEducations}: { allEducations: (typeof educations.$inferSelect)[] }) => {
	const [currentEducations, setCurrentEducations] = useState<z.infer<typeof educationFormSchema>[]>(allEducations.map(education => ({
		id: education.id,
		institutionName: education.institutionName as string | undefined,
		country: education.country as string | undefined,
		fieldOfStudy: education.fieldOfStudy as string | undefined,
		degree: education.degree as string | undefined,
		startedFromMonth: education.startedFromMonth ? months[education.startedFromMonth - 1] : undefined,
		startedFromYear: education.startedFromYear ? education.startedFromYear.toString() : undefined,
		finishedAtMonth: education.finishedAtMonth ? months[education.finishedAtMonth - 1] : undefined,
		finishedAtYear: education.finishedAtYear ? education.finishedAtYear.toString() : undefined,
		current: education.current as boolean | undefined,
		description: education.description as string | undefined
	})))
	const [parent] = useAutoAnimate()

	const handleDeleteEducation = async (index: number) => {
		const educationToDelete = currentEducations[index]
		if (!educationToDelete.id) {
			toast.error('Cannot delete education without an ID')
			return
		}

		try {
			const result = await deleteEducationFromDB(educationToDelete.id)
			if (result && result.length > 0) {
				setCurrentEducations(prev => prev.filter((_, i) => i !== index))
				toast.success('Education deleted successfully')
			} else {
				throw new Error('Failed to delete education')
			}
		} catch (error) {
			toast.error('Failed to delete education. Please try again.')
		}
	}

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 pt-16">
			{/* HEADING TEXT */}
			<div>
				<TextAnimate
					text="Tell us more"
					type="calmInUp"
					className="text-5xl leading-snug"
					{...({} as any)}
					/>
				<TextAnimate
					text="about your education"
					type="calmInUp"
					className="text-5xl leading-snug"
					{...({} as any)}
					/>
			</div>

			{/* FORM */}
			<EducationForm educations={currentEducations} setEducations={setCurrentEducations} />

			{/* EDUCATIONS */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: currentEducations.length > 0 ? 1 : 0, y: currentEducations.length > 0 ? '-50%' : '-30%'}}
				transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="absolute h-[512px] w-[40%] right-16 top-1/2 -translate-y-1/2 overflow-auto"
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
			>
				<h3 className="text-center text-3xl font-medium">Educations</h3>

				<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
					{currentEducations.map(
						(education, index) => (
							<li key={index} className="bg-white rounded-xl py-4 px-6 shadow-lg relative">
								<PopConfirm
									triggerElement={
										<button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
											<X size={16} />
										</button>
									}
									message="Are you sure you want to delete this education?"
									onYes={() => handleDeleteEducation(index)}
								/>
								<p className="truncate font-medium text-xl">
									{education.degree + ' '}
									{education.degree && education.fieldOfStudy && 'in'} {education.fieldOfStudy + ' '}
									{(education.fieldOfStudy || education.degree) && education.institutionName && 'from '}
									{education.institutionName}
								</p>
								<p className="mt-1 text-sm">
									{education.startedFromMonth && education.startedFromYear && 'From '}
									{education.startedFromMonth} {education.startedFromYear}

									{education.finishedAtMonth && education.finishedAtYear && ' until '}
									{education.finishedAtMonth} {education.finishedAtYear}
								</p>
							</li>
						)
					)}
				</ul>
			</motion.div>
		</div>
	)
}

export default Education
