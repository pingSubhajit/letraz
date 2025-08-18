'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import {JSX} from 'react'
import {motion} from 'motion/react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import ExperienceForm from '@/components/onboarding/ExperienceForm'
import {months} from '@/constants'
import {X} from 'lucide-react'
import {toast} from 'sonner'
import PopConfirm from '@/components/ui/pop-confirm'
import {experienceQueryOptions, useCurrentExperiences} from '@/lib/experience/queries'
import {useDeleteExperienceMutation} from '@/lib/experience/mutations'
import {useQueryClient} from '@tanstack/react-query'
import {sanitizeHtml} from '@/lib/utils'

/**
 * Experience component to display and manage user's experience details.
 *
 * @param {Object} props - Component props
 * @param {ExperienceType[]} props.allExperiences - Array of experience details
 * @returns {JSX.Element} The Experience component
 */
const Experience = (): JSX.Element => {
	const queryClient = useQueryClient()


	// State to manage the current list of experiences
	const {data: currentExperiences} = useCurrentExperiences()

	const [parent] = useAutoAnimate()

	const {mutateAsync} = useDeleteExperienceMutation({
		onMutate: async (experienceId) => {
			await queryClient.cancelQueries(experienceQueryOptions())
			const prevExperiences = queryClient.getQueryData(experienceQueryOptions().queryKey)
			queryClient.setQueryData(experienceQueryOptions().queryKey, (oldData) => oldData ? oldData.filter(i => i.id !== experienceId.id) : oldData )
			return {prevExperiences}
		},
		// TODO remove this any the
		onError: (err, newExperience, context:any) => {
			queryClient.setQueryData(experienceQueryOptions().queryKey, context?.prevExperiences)
			toast.error('Failed to delete experience.')
		},
		onSettled: () => {
			queryClient.invalidateQueries(experienceQueryOptions())
		}
	})

	/**
	 * Handles the deletion of an experience entry.
	 * @param {string} experienceId - Index of the experience entry to delete
	 */
	const handleDeleteExperience = async (experienceId:string) => {
		await mutateAsync({id: experienceId})
	}

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 mb-40 pt-16">
			{/* HEADING TEXT */}
			<div>
				<TextAnimate
					text="What about"
					type="calmInUp"
					className="text-5xl leading-snug"
				/>
				<TextAnimate
					text="your past experiences"
					type="calmInUp"
					className="text-5xl leading-snug"
				/>
			</div>

			{/* FORM */}
			<ExperienceForm />

			{/* EXPERIENCES */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: currentExperiences?.length as number > 0 ? 1 : 0, y: currentExperiences?.length as number > 0 ? '-50%' : '-30%'}}
				transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="absolute h-[700px] w-[40%] right-16 top-1/2 -translate-y-1/2"
			>
				<div className="h-full w-full overflow-y-auto hide-scrollbar" data-lenis-prevent>
					<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
						{currentExperiences?.map(
							(experience) => (
								<li
									key={experience.id}
									className={`bg-white rounded-xl py-4 px-6 shadow-lg relative transition-all duration-300 ease-in-out group ${
										experience.description ? 'hover:shadow-xl cursor-pointer' : ''
									}`}
								>
									<PopConfirm
										triggerElement={
											<button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10">
												<X size={16} />
											</button>
										}
										message="Are you sure you want to delete this experience?"
										onYes={() => handleDeleteExperience(experience.id)}
									/>
									<p className="truncate font-medium text-xl">
										{experience.job_title && experience.job_title + ' '}
										{experience.job_title && 'in'} {experience.company_name}
									</p>
									<p className="mt-1 text-sm">
										{experience.started_from_month && experience.started_from_year && 'From '}
										{experience.started_from_month && months.find(month => parseInt(month.value) === experience.started_from_month)?.label} {experience.started_from_year}

										{experience.finished_at_month && experience.finished_at_year && ' until '}
										{experience.finished_at_month && months.find(month => parseInt(month.value) === experience.finished_at_month)?.label} {experience.finished_at_year}
									</p>

									{/* Expandable description section */}
									{experience.description && (
										<div className="mt-3 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-48 group-hover:opacity-100">
											<div className="border-t border-gray-200">
												<div
													className="prose prose-sm max-w-none text-gray-700 max-h-44 overflow-hidden"
													dangerouslySetInnerHTML={{__html: sanitizeHtml(experience.description)}}
												/>
											</div>
										</div>
									)}
								</li>
							)
						)}
					</ul>
				</div>
			</motion.div>
		</div>
	)
}

export default Experience
