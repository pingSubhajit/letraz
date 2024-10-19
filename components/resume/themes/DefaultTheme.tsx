'use client'

import {personalInfo} from '@/db/personalInfo.schema'
import {ResumeSection, ResumeSections} from '@/db/resumes.schema'
import {LegacyRef, ReactNode} from 'react'
import {educations, experiences} from '@/db/schema'
import {Calendar, Globe, Mail, MapPin, Phone} from 'lucide-react'
import {cn} from '@/lib/utils'

const DefaultTheme = ({sections, personalInfoData, resumeRef}: {
	sections?: ResumeSection[],
	personalInfoData?: typeof personalInfo.$inferSelect,
	resumeRef?: LegacyRef<any>
}) => {
	return (
		<div ref={resumeRef}>
			<div className="p-12">
				<PersonalInfo personalInfoData={personalInfoData}/>
				{sections?.map((section, index) => (
					<div key={section.id} className="space-y-4">
						{section.type === ResumeSections.EDUCATION && <EducationSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}

						{section.type === ResumeSections.EXPERIENCE && <ExperienceSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}
					</div>
				))}
			</div>
		</div>
	)
}

export default DefaultTheme

const Divider = ({className}: { className?: string }) => <div className={cn('h-[0.5px] bg-primary w-full', className)}/>

const SectionTitle = ({children, className}: {children: ReactNode, className?: string}) => <p className={cn('text-base font-semibold uppercase', className)}>{children}</p>

const PersonalInfo = ({personalInfoData}: { personalInfoData?: typeof personalInfo.$inferSelect }) => {
	return (
		<div className="flex flex-col gap-3 items-center">
			{/* NAME */}
			<p className="text-3xl font-bold">{personalInfoData?.firstName} {personalInfoData?.lastName}</p>

			{/* CONTACT INFO */}
			<div className="w-full flex flex-wrap gap-x-4 gap-y-2 justify-center text-sm">
				{/* EMAIL */}
				{personalInfoData?.email && <div className="flex items-center">
					<Mail className="w-4 h-4 mr-1"/>
					<p>{personalInfoData.email}</p>
				</div>}

				{/* PHONE */}
				{personalInfoData?.phone && <div className="flex items-center">
					<Phone className="w-4 h-4 mr-1"/>
					<p>{personalInfoData?.phone}</p>
				</div>}

				{/* LOCATION */}
				<div className="flex items-center gap-1">
					{/* ICON */}
					{(personalInfoData?.address || personalInfoData?.city || personalInfoData?.country || personalInfoData?.postal) &&
                        <MapPin className="w-4 h-4"/>
					}

					{/* LOCATION INFO */}
					{personalInfoData?.address && <p>{personalInfoData?.address}, </p>}
					{personalInfoData?.city && <p>{personalInfoData?.city}, </p>}
					{personalInfoData?.postal && <p>{personalInfoData?.postal}, </p>}
					{personalInfoData?.country && <p>{personalInfoData?.country}</p>}
				</div>

				{/* DOB */}
				{personalInfoData?.dob && <div className="flex items-center">
					<Calendar className="'w-4 h-4 mr-1"/>
					<p>{personalInfoData?.dob}</p>
				</div>}

				{/* WEBSITE */}
				{personalInfoData?.website && <div className="flex items-center">
					<Globe className="'w-4 h-4 mr-1"/>
					<p>{personalInfoData?.website}</p>
				</div>}
			</div>

			{/* PROFILE */}
			{personalInfoData?.profileText && <div className="w-full">
				{/* TITLE */}
				<div>
					<SectionTitle>Summary</SectionTitle>

					{/* DIVIDER */}
					<Divider className="mb-1.5" />
				</div>
				<p className="text-justify leading-snug text-sm">{personalInfoData?.profileText}</p>
			</div>}
		</div>
	)
}

type EducationSectionProps = {
	section: ResumeSection & { type: ResumeSections.EDUCATION, data: typeof educations.$inferSelect }
	previousSectionType?: ResumeSections
}

const EducationSection = ({section, previousSectionType}: EducationSectionProps) => {
	const {data: education} = section

	return (
		<div className={cn('flex flex-col items-stretch pl-4', previousSectionType === ResumeSections.EDUCATION && 'mt-2')}>
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EDUCATION && <div className="mt-8 -ml-4">
				<SectionTitle>Education</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* INSTITUTION & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* INSTITUTION */}
				<p className="text-sm leading-normal">
					{education?.institutionName && <span className="font-bold">{education.institutionName}</span>}
					{education?.institutionName && education?.country && <span>, </span>}
					{education?.country && <span>{education.country}</span>}
				</p>

				<p className="text-sm">
					{education.startedFromMonth && education.startedFromYear &&
                        <span>From {education.startedFromMonth}/{education.startedFromYear}</span>}
					{education.startedFromMonth && education.startedFromYear && education.finishedAtMonth && education.finishedAtYear &&
                        <span>&nbsp; &nbsp;</span>}
					{education.finishedAtMonth && education.finishedAtYear &&
                        <span>To {education.finishedAtMonth}/{education.finishedAtYear}</span>}
				</p>
			</div>

			{/* DEGREE */}
			<p className="text-sm italic">
				{education.degree && <span>{education.degree}</span>}
				{education.degree && education.fieldOfStudy && <span> in </span>}
				{education.fieldOfStudy && <span>{education.fieldOfStudy}</span>}
			</p>

			{/* DESCRIPTION */}
			{education.description && <p className="text-sm leading-snug mt-0.5 pl-8">{education.description}</p>}
		</div>
	)
}

type ExperienceSectionProps = {
	section: ResumeSection & { type: ResumeSections.EXPERIENCE, data: typeof experiences.$inferSelect }
	previousSectionType?: ResumeSections
}

const ExperienceSection = ({section, previousSectionType}: ExperienceSectionProps) => {
	const {data: experience} = section

	return (
		<div className={cn('flex flex-col items-stretch pl-4', previousSectionType === ResumeSections.EXPERIENCE && 'mt-2')}>
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EXPERIENCE && <div className="mt-8 -ml-4">
				<SectionTitle>Experience</SectionTitle>

				{/* DIVIDER */}
				<Divider className="mb-1.5"/>
			</div>}

			{/* COMPANY & DATES */}
			<div className="w-full flex flex-row items-center justify-between gap-4">
				{/* COMPANY */}
				<p className="text-sm leading-normal">
					{experience?.companyName && <span className="font-bold">{experience.companyName}</span>}
					{experience?.companyName && experience?.country && <span>, </span>}
					{experience?.country && <span>{experience.country}</span>}
				</p>

				<p className="text-sm">
					{experience.startedFromMonth && experience.startedFromYear &&
                        <span>From {experience.startedFromMonth}/{experience.startedFromYear}</span>}
					{experience.startedFromMonth && experience.startedFromYear && experience.finishedAtMonth && experience.finishedAtYear &&
                        <span>    </span>}
					{experience.finishedAtMonth && experience.finishedAtYear &&
                        <span>To {experience.finishedAtMonth}/{experience.finishedAtYear}</span>}
				</p>
			</div>

			{/* Role */}
			<p className="text-sm italic">
				{experience.jobTitle && <span>{experience.jobTitle}</span>}
				{experience.jobTitle && experience.employmentType && <span>, </span>}
				{experience.jobTitle && <span>{experience.employmentType}</span>}
			</p>

			{/* DESCRIPTION */}
			{experience.description && <p className="text-sm leading-snug mt-0.5 pl-8">{experience.description}</p>}
		</div>
	)
}
