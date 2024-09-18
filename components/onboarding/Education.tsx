'use client'

import TextAnimate from '@/components/animations/TextAnimations'
import EducationForm, {educationFormSchema} from '@/components/onboarding/EducationForm'
import {z} from 'zod'
import {useState} from 'react'
import {motion} from 'framer-motion'
import {useAutoAnimate} from '@formkit/auto-animate/react'

const Education = () => {
	const [educations, setEducations] = useState<z.infer<typeof educationFormSchema>[]>([])
	const [parent, enableAnimations] = useAutoAnimate()

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 pt-16">
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
			<EducationForm educations={educations} setEducations={setEducations} />

			{/* EDUCATIONS */}
			<motion.div
				initial={{opacity: 0, y: '-30%'}}
				animate={{opacity: educations.length > 0 ? 1 : 0, y: educations.length > 0 ? '-50%' : '-30%'}} transition={{
					type: 'tween',
					ease: 'easeInOut'
				}}
				className="absolute h-[512px] w-[40%] right-16 top-1/2 -translate-y-1/2 overflow-auto"
			>
				<h3 className="text-center text-3xl font-medium">Educations</h3>

				<ul ref={parent} className="mt-8 max-w-lg mx-auto flex flex-col gap-4">
					{educations.map(
						(education, index) => <li key={index} className="bg-white rounded-xl py-4 px-6 shadow-lg">
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
					)}
				</ul>
			</motion.div>
		</div>
	)
}

export default Education
