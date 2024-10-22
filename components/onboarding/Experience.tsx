'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import {z} from 'zod'
import {useState} from 'react'
import {motion} from 'framer-motion'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import ExperienceForm, {experienceFormSchema} from '@/components/onboarding/ExperienceForm'
import {experiences} from '@/db/schema'
import {months} from '@/constants'

const Experience = ({allExperiences}: {allExperiences: (typeof experiences.$inferSelect)[]}) => {
	const [experiences, setExperiences] = useState<z.infer<typeof experienceFormSchema>[]>(allExperiences.map(experience => ({
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

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 pt-16">
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
			<ExperienceForm experiences={experiences} setExperiences={setExperiences} />


			{/* EDUCATIONS */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: experiences.length > 0 ? 1 : 0, y: experiences.length > 0 ? '-50%' : '-30%'}} transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="absolute h-[512px] w-[40%] right-16 top-1/2 -translate-y-1/2 overflow-auto"
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
			>
				<h3 className="text-center text-3xl font-medium">Experiences</h3>

				<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
					{experiences.map(
						(education, index) => <li key={index} className="bg-white rounded-xl py-4 px-6 shadow-lg">
							<p className="truncate font-medium text-xl">
								{education.jobTitle && education.jobTitle + ' '}
								{education.jobTitle && 'in'} {education.companyName}
							</p>
							<p className="mt-1 text-sm">
								{education.startedFromMonth && education.startedFromYear && 'From '}
								{education.startedFromMonth} {education.startedFromYear}

								{education.finishedAtMonth && education.finishedAtYear && ' until '}
								{education.finishedAtMonth} {education.finishedAtYear}
							</p>
						</li>
					)}
				</ul>
			</motion.div>
		</div>
	)
}

export default Experience
