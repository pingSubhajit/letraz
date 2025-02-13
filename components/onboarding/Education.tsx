'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import EducationForm from '@/components/onboarding/EducationForm'
import {JSX} from 'react'
import {motion} from 'motion/react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {months} from '@/constants'
import {X} from 'lucide-react'
import PopConfirm from '@/components/ui/pop-confirm'
import {toast} from 'sonner'
import {deleteEducationFromDB} from '@/lib/education/actions'
import {Education as EducationType} from '@/lib/education/types'
import {ScrollArea} from '@/components/ui/scroll-area'
import {useCurrentEducations} from '@/lib/education/queries'
import {useQueryClient} from '@tanstack/react-query'
import {EDUCATION_KEYS} from '@/lib/education/keys'

/**
 * Education component to display and manage user's education details.
 *
 * @param {Object} props - Component props
 * @param {EducationType[]} props.allEducations - Array of education details
 * @returns {JSX.Element} The Education component
 */
const Education = (): JSX.Element => {
	// State to manage the current list of educations

	const queryClient = useQueryClient()
	// const [currentEducations, setCurrentEducations] = useState<EducationType[]>(allEducations)
	const [parent] = useAutoAnimate()

	/**
	 * Handles the deletion of an education entry.
	 * @param {number} index - Index of the education entry to delete
	 */
	const handleDeleteEducation = async (index: number) => {
		// eslint-disable-next-line @stylistic/js/multiline-comment-style
		// const educationToDelete = currentEducations[index]
		// // Check if the education has an ID
		// if (!educationToDelete.id) {
		// 	toast.error('Cannot delete education without an ID')
		// 	return
		// }
		// // Delete the education from the database
		// try {
		// 	await deleteEducationFromDB(educationToDelete.id)
		// 	setCurrentEducations(prev => prev.filter((_, i) => i !== index))
		// 	toast.success('Education deleted successfully')
		// } catch (error) {
		// 	toast.error('Failed to delete education. Please try again.')
		// }
	}


	// const currentEducations = queryClient.getQueryData<EducationType[]>(EDUCATION_KEYS) || []

	const {data: currentEducations} = useCurrentEducations()

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 mb-40 pt-16">
			<ScrollArea>
				{/* HEADING TEXT */}
				<div>
					<TextAnimate
						text="Tell us more"
						type="calmInUp"
						className="text-5xl leading-snug"
					/>
					<TextAnimate
						text="about your education"
						type="calmInUp"
						className="text-5xl leading-snug"
					/>
				</div>


				{/* FORM */}
				<EducationForm />
			</ScrollArea>

			{/* EDUCATIONS */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: currentEducations?.length as number > 0 ? 1 : 0, y: currentEducations?.length as number > 0 ? '-50%' : '-30%'}}
				transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="absolute h-[512px] w-[40%] right-16 top-1/2 -translate-y-1/2 overflow-auto"
			>
				<h3 className="text-center text-3xl font-medium">Educations</h3>

				<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
					{currentEducations?.map(
						(education, index) => (
							// EDUCATION ITEM
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
									{education.degree && education.field_of_study && 'in'} {education.field_of_study + ' '}
									{(education.field_of_study || education.degree) && education.institution_name && 'from '}
									{education.institution_name}
								</p>
								<p className="mt-1 text-sm">
									{education.started_from_month && education.started_from_year && 'From '}
									{education.started_from_month && months.find(month => parseInt(month.value) === education.started_from_month)?.label} {education.started_from_year?.toString()}

									{education.finished_at_month && education.finished_at_year && ' until '}
									{education.finished_at_month && months.find(month => parseInt(month.value) === education.finished_at_month)?.label} {education.finished_at_year?.toString()}
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
