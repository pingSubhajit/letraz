'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import EducationForm from '@/components/onboarding/EducationForm'
import {JSX, useState} from 'react'
import {motion} from 'motion/react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {months} from '@/constants'
import {X} from 'lucide-react'
import PopConfirm from '@/components/ui/pop-confirm'
import {toast} from 'sonner'
import {ScrollArea} from '@/components/ui/scroll-area'
import {educationOptions, useCurrentEducations} from '@/lib/education/queries'
import {useQueryClient} from '@tanstack/react-query'
import {useDeleteEducationMutation} from '@/lib/education/mutations'
import {sanitizeHtml, cn} from '@/lib/utils'

/**
 * Education component to display and manage user's education details.
 *
 * @param {Object} props - Component props
 * @param {EducationType[]} props.allEducations - Array of education details
 * @returns {JSX.Element} The Education component
 */
const Education = (): JSX.Element => {
	// State to manage the current list of educations
	const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')

	const queryClient = useQueryClient()
	const [parent] = useAutoAnimate()

	/**
	 * Handles the deletion of an education entry.
	 * @param {string} educationId - Id of the education entry to delete
	 */
	const {data: currentEducations} = useCurrentEducations()


	const {mutateAsync} = useDeleteEducationMutation({
		onMutate: async (educationId) => {
			await queryClient.cancelQueries(educationOptions())
			const prevEducations = queryClient.getQueryData(educationOptions().queryKey)
			queryClient.setQueryData(educationOptions().queryKey, (oldData) => oldData ? oldData.filter(i => i.id !== educationId.id) : oldData )
			return {prevEducations}
		},
		// TODO remove this any the
		onError: (err, newEducation, context:any) => {
			queryClient.setQueryData(educationOptions().queryKey, context?.prevEducations)
			toast.error('Failed to delete education.')
		},
		onSettled: () => {
			queryClient.invalidateQueries(educationOptions())
		}

	})

	const handleDeleteEducation = (id:string) => {
		mutateAsync({id})
	}


	return (
		<div className="w-full h-full flex flex-col justify-start pl-4 sm:pl-8 lg:pl-16 mb-20 sm:mb-32 lg:mb-40 pt-12 sm:pt-14 lg:pt-16 pr-4 sm:pr-8 md:pr-8 lg:pr-0">
			{/* HEADING TEXT */}
			<div className="px-0 sm:px-0">
				<TextAnimate
					text="Tell us more"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed"
				/>
				<TextAnimate
					text="about your education"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed pb-2"
				/>
			</div>

			{/* MOBILE TABS */}
			<div className="flex lg:hidden gap-3 sm:gap-4 mt-6 sm:mt-8 mb-4 sm:mb-6">
				<button
					onClick={() => setActiveTab('form')}
					className={cn(
						'flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors min-h-[44px]',
						activeTab === 'form'
							? 'bg-flame-500 text-white'
							: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
					)}
				>
					Add Education
				</button>
				<button
					onClick={() => setActiveTab('list')}
					className={cn(
						'flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors min-h-[44px]',
						activeTab === 'list'
							? 'bg-flame-500 text-white'
							: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
					)}
				>
					Review ({currentEducations?.length || 0})
				</button>
			</div>

			<ScrollArea className="hidden lg:block">
				{/* FORM - Desktop only */}
				<EducationForm />
			</ScrollArea>

			{/* MOBILE VIEWS */}
			<div className="lg:hidden flex-1 overflow-hidden">
				{activeTab === 'form' && <EducationForm />}
				{activeTab === 'list' && (
					<div className="h-full overflow-y-auto hide-scrollbar" data-lenis-prevent>
						<ul ref={parent} className="mt-4 flex flex-col gap-4">
							{currentEducations?.map(
								(education) => (
									// EDUCATION ITEM
									<li
										key={education.id}
										className={`bg-white rounded-xl py-4 px-6 shadow-lg relative transition-all duration-300 ease-in-out group ${
											education.description ? 'hover:shadow-xl cursor-pointer' : ''
										}`}
									>
										<PopConfirm
											triggerElement={
												<button className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700 z-10">
													<X size={16} />
												</button>
											}
											message="Are you sure you want to delete this education?"
											onYes={() => handleDeleteEducation(education.id)}
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

										{/* Expandable description section */}
										{education.description && (
											<div className="mt-3 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-48 group-hover:opacity-100">
												<div className="border-t border-neutral-200">
													<div
														className="prose prose-sm max-w-none text-neutral-700 max-h-44 overflow-hidden"
														dangerouslySetInnerHTML={{__html: sanitizeHtml(education.description)}}
													/>
												</div>
											</div>
										)}
									</li>
								)
							)}
						</ul>
					</div>
				)}
			</div>

			{/* EDUCATIONS - Desktop only */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: currentEducations?.length as number > 0 ? 1 : 0, y: currentEducations?.length as number > 0 ? '-50%' : '-30%'}}
				transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="hidden lg:block absolute h-[60vh] 3xl:h-[70vh] w-[40%] right-16 top-1/2 -translate-y-1/2 overflow-auto"
			>
				<div className="h-full w-full overflow-y-auto hide-scrollbar" data-lenis-prevent>
					<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
						{currentEducations?.map(
							(education) => (
								// EDUCATION ITEM
								<li
									key={education.id}
									className={`bg-white rounded-xl py-4 px-6 shadow-lg relative transition-all duration-300 ease-in-out group ${
										education.description ? 'hover:shadow-xl cursor-pointer' : ''
									}`}
								>
									<PopConfirm
										triggerElement={
											<button className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700 z-10">
												<X size={16} />
											</button>
										}
										message="Are you sure you want to delete this education?"
										onYes={() => handleDeleteEducation(education.id)}
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

									{/* Expandable description section */}
									{education.description && (
										<div className="mt-3 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-48 group-hover:opacity-100">
											<div className="border-t border-neutral-200">
												<div
													className="prose prose-sm max-w-none text-neutral-700 max-h-44 overflow-hidden"
													dangerouslySetInnerHTML={{__html: sanitizeHtml(education.description)}}
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

export default Education
