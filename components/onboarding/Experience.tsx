'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import {JSX, useState} from 'react'
import {motion} from 'motion/react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import ExperienceForm from '@/components/onboarding/ExperienceForm'
import {months} from '@/constants'
import {ChevronLeft, ChevronRight, X} from 'lucide-react'
import {toast} from 'sonner'
import PopConfirm from '@/components/ui/pop-confirm'
import {experienceQueryOptions, useCurrentExperiences} from '@/lib/experience/queries'
import {useDeleteExperienceMutation} from '@/lib/experience/mutations'
import {useQueryClient} from '@tanstack/react-query'
import {cn, sanitizeHtml} from '@/lib/utils'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Button} from '@/components/ui/button'
import {Link, useTransitionRouter} from 'next-view-transitions'
import {updateOnboardingStep} from '@/lib/onboarding/actions'
import {useAuth} from '@clerk/nextjs'

/**
 * Experience component to display and manage user's experience details.
 *
 * @param {Object} props - Component props
 * @param {ExperienceType[]} props.allExperiences - Array of experience details
 * @returns {JSX.Element} The Experience component
 */
const Experience = (): JSX.Element => {
	const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')
	const router = useTransitionRouter()
	const {getToken} = useAuth()
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

	const handleNext = async () => {
		try {
			await updateOnboardingStep('experience')
			try {await getToken({skipCache: true})} catch {}
			router.push('/app/onboarding?step=resume')
		} catch (error) {
			toast.error('Failed to proceed. Please try again.')
		}
	}

	return (
		<div className="w-full h-full flex flex-col justify-start pl-4 sm:pl-8 lg:pl-16 pt-12 sm:pt-14 lg:pt-16 pr-4 sm:pr-8 md:pr-8 lg:pr-0">
			{/* HEADING TEXT */}
			<div>
				<TextAnimate
					text="What about"
					type="calmInUp"
					className="text-4xl sm:text-5xl lg:text-7xl leading-relaxed"
				/>
				<TextAnimate
					text="your past experiences"
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
					Add Experience
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
					Review ({currentExperiences?.length || 0})
				</button>
			</div>

			<ScrollArea className="hidden lg:block">
				{/* FORM - Desktop only */}
				<ExperienceForm />
			</ScrollArea>

			{/* MOBILE VIEWS */}
			<div className="lg:hidden flex-1 overflow-hidden">
				{activeTab === 'form' && (
					<div className="h-full overflow-y-auto hide-scrollbar pb-20 sm:pb-32 lg:pb-40" data-lenis-prevent>
						<ExperienceForm />
					</div>
				)}
				{activeTab === 'list' && (
					<div className="h-full overflow-y-auto hide-scrollbar pb-20 sm:pb-32 lg:pb-40" data-lenis-prevent>
						<ul ref={parent} className="mt-4 flex flex-col gap-4">
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
												<button className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700 z-10">
													<X size={16} />
												</button>
											}
											message="Are you sure you want to delete this experience?"
											onYes={() => handleDeleteExperience(experience.id)}
										/>
										<p className="truncate font-medium text-lg lg:text-lg xl:text-xl">
											{experience.job_title && experience.job_title + ' '}
											{experience.job_title && 'in'} {experience.company_name}
										</p>
										<p className="mt-1 text-xs lg:text-xs xl:text-sm">
											{experience.started_from_month && experience.started_from_year && 'From '}
											{experience.started_from_month && months.find(month => parseInt(month.value) === experience.started_from_month)?.label} {experience.started_from_year}

											{experience.finished_at_month && experience.finished_at_year && ' until '}
											{experience.finished_at_month && months.find(month => parseInt(month.value) === experience.finished_at_month)?.label} {experience.finished_at_year}
										</p>

										{/* Expandable description section */}
										{experience.description && (
											<div className="mt-3 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-48 group-hover:opacity-100">
												<div className="border-t border-neutral-200">
													<div
														className="prose prose-sm max-w-none text-neutral-700 max-h-44 overflow-hidden"
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
				)}
			</div>

			{/* Navigation buttons for Review tab - Mobile only */}
			{activeTab === 'list' && (
				<div className="lg:hidden w-full px-2 sm:px-4 md:px-8 flex flex-wrap items-center justify-between gap-2 sm:gap-3 fixed left-0 z-10 bottom-6 sm:bottom-12">
					<Link href={'/app/onboarding?step=education'} className="order-1">
						<Button
							className="transition rounded-full shadow-lg hover:shadow-xl px-3 sm:px-5 lg:px-6 text-xs sm:text-sm"
							variant="secondary"
							type="button"
							size="sm"
						>
							<ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5 mr-1" />
							<span className="hidden min-[520px]:inline">Education</span>
							<span className="min-[520px]:hidden">Back</span>
						</Button>
					</Link>

					<Button
						onClick={handleNext}
						className="transition rounded-full shadow-lg px-2 sm:px-4 lg:px-6 hover:shadow-xl text-xs sm:text-sm order-2"
						variant="secondary"
						type="button"
						size="sm"
					>
						<span className="min-[520px]:inline">Create my base résumé</span>
						<ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 ml-1" />
					</Button>
				</div>
			)}

			{/* EXPERIENCES - Desktop only */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: currentExperiences?.length as number > 0 ? 1 : 0, y: currentExperiences?.length as number > 0 ? '-50%' : '-30%'}}
				transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="hidden lg:block absolute h-[400px] sm:h-[550px] lg:h-[700px] w-[30%] xl:w-[40%] right-16 top-[65%] -translate-y-1/2"
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
											<button className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-700 z-10">
												<X size={16} />
											</button>
										}
										message="Are you sure you want to delete this experience?"
										onYes={() => handleDeleteExperience(experience.id)}
									/>
									<p className="truncate font-medium text-lg lg:text-lg xl:text-xl">
										{experience.job_title && experience.job_title + ' '}
										{experience.job_title && 'in'} {experience.company_name}
									</p>
									<p className="mt-1 text-xs lg:text-xs xl:text-sm">
										{experience.started_from_month && experience.started_from_year && 'From '}
										{experience.started_from_month && months.find(month => parseInt(month.value) === experience.started_from_month)?.label} {experience.started_from_year}

										{experience.finished_at_month && experience.finished_at_year && ' until '}
										{experience.finished_at_month && months.find(month => parseInt(month.value) === experience.finished_at_month)?.label} {experience.finished_at_year}
									</p>

									{/* Expandable description section */}
									{experience.description && (
										<div className="mt-3 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-48 group-hover:opacity-100">
											<div className="border-t border-neutral-200">
												<div
													className="prose prose-sm max-w-none text-neutral-700 max-h-44 overflow-hidden"
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
