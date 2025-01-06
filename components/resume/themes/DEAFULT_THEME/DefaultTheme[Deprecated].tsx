'use client'

import {personalInfo} from '@/db/personalInfo.schema'
import {ResumeSection, ResumeSections} from '@/db/resumes.schema'
import {createTw} from 'react-pdf-tailwind'
import tailwindConfig from '@/tailwind.config'
import {Document, Page, Text, View} from '@react-pdf/renderer'
import {Style} from '@react-pdf/types'
import PhonePDF from '@/components/resume/icons/PhonePDF'
import MailPDF from '@/components/resume/icons/MailPDF'
import MapPinPDF from '@/components/resume/icons/MapPinPDF'
import CalendarPDF from '@/components/resume/icons/CalendarPDF'
import GlobePDF from '@/components/resume/icons/GlobePDF'
import {LegacyRef} from 'react'
import {educations, experiences} from '@/db/schema'

const tw = createTw(tailwindConfig) as (input: string) => Style | Style[] | undefined

const DefaultThemeDeprecated = ({sections, personalInfoData, resumeRef}: {
	sections?: ResumeSection[],
	personalInfoData?: typeof personalInfo.$inferSelect,
	resumeRef?: LegacyRef<any>
}) => {
	return (
		<Document ref={resumeRef}>
			<Page style={tw('absolute p-12')}>
				<PersonalInfo personalInfoData={personalInfoData} />
				{sections?.map((section, index) => (
					<View key={section.id} style={tw('mb-6')}>
						{section.type === ResumeSections.EDUCATION && <EducationSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}

						{section.type === ResumeSections.EXPERIENCE && <ExperienceSection
							section={section as any}
							previousSectionType={sections[index - 1]?.type}
						/>}
					</View>
				))}
			</Page>
		</Document>
	)
}

export default DefaultThemeDeprecated

const Divider = () => <View style={tw('h-[0.5px] bg-primary w-full bg-black')} />

const PersonalInfo = ({personalInfoData}: { personalInfoData?: typeof personalInfo.$inferSelect }) => {
	return (
		<View style={tw('flex flex-col gap-6 items-center')}>
			{/* NAME */}
			<Text style={tw('text-3xl font-bold leading-none')}>{personalInfoData?.firstName} {personalInfoData?.lastName}</Text>

			{/* CONTACT INFO */}
			<View style={tw('w-full flex flex-row flex-wrap m-0 gap-x-4 gap-y-2 flex-wrap justify-center')}>
				{/* EMAIL */}
				{personalInfoData?.email && <View style={tw('flex items-center flex-row')}>
					<MailPDF style={tw('w-4 h-4 m-0 mr-1')} />
					<Text style={tw('text-sm leading-none')}>{personalInfoData.email}</Text>
				</View>}

				{/* PHONE */}
				{personalInfoData?.phone && <View style={tw('flex items-center flex-row')}>
					<PhonePDF style={tw('w-3.5 h-3.5 m-0 mr-1')} />
					<Text style={tw('text-sm leading-none')}>{personalInfoData?.phone}</Text>
				</View>}

				{/* LOCATION */}
				<View style={tw('flex flex-row items-center gap-1 whitespace-nowrap leading-none')}>
					{/* ICON */}
					{/* {(personalInfoData?.address || personalInfoData?.city || personalInfoData?.country || personalInfoData?.postal) &&*/}
					<MapPinPDF style={tw('w-4 h-4 m-0')} />
					{/* }*/}

					{/* LOCATION INFO */}
					{personalInfoData?.address && <Text style={tw('text-sm leading-none')}>{personalInfoData?.address}, </Text>}
					{personalInfoData?.city && <Text style={tw('text-sm leading-none')}>{personalInfoData?.city}, </Text>}
					{personalInfoData?.postal && <Text style={tw('text-sm leading-none')}>{personalInfoData?.postal}, </Text>}
					{personalInfoData?.country && <Text style={tw('text-sm leading-none')}>{personalInfoData?.country}</Text>}
				</View>

				{/* DOB */}
				{personalInfoData?.dob && <View style={tw('flex items-center flex-row')}>
					<CalendarPDF style={tw('w-4 h-4 m-0 mr-1')} />
					<Text style={tw('text-sm leading-none')}>{personalInfoData?.dob}</Text>
				</View>}

				{/* WEBSITE */}
				{personalInfoData?.website && <View style={tw('flex items-center flex-row')}>
					<GlobePDF style={tw('w-4 h-4 m-0 mr-1')} />
					<Text style={tw('text-sm leading-none')}>{personalInfoData?.website}</Text>
				</View>}
			</View>

			{/* PROFILE */}
			{personalInfoData?.profileText && <Text style={tw('w-full text-justify text-sm leading-snug')}>{personalInfoData?.profileText}</Text>}

			{/* DIVIDER */}
			<Divider />
		</View>
	)
}

type EducationSectionProps = {
	section: ResumeSection & {type: ResumeSections.EDUCATION, data: typeof educations.$inferSelect}
	previousSectionType?: ResumeSections
}

const EducationSection = ({section, previousSectionType}: EducationSectionProps) => {
	const {data: education} = section

	return (
		<View style={tw('flex flex-col items-stretch')}>
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EDUCATION && <View style={tw('mt-8 mb-3')}>
				<Text style={tw('text-xl font-bold leading-normal')}>Education</Text>

				{/* DIVIDER */}
				<Divider />
			</View>}

			{/* INSTITUTION & DATES */}
			<View style={tw('w-full flex flex-row items-center justify-between gap-4')}>
				{/* INSTITUTION */}
				<Text>
					{education?.institutionName && <Text style={tw('text-lg leading-normal')}>{education.institutionName}</Text>}
					{education?.institutionName && education?.country && <Text style={tw('text-lg leading-normal')}>, </Text>}
					{education?.country && <Text style={tw('text-lg leading-normal')}>{education.country}</Text>}
				</Text>

				<Text style={tw('text-sm')}>
					{education.startedFromMonth && education.startedFromYear && <Text>From {education.startedFromMonth}/{education.startedFromYear}</Text>}
					{education.startedFromMonth && education.startedFromYear && education.finishedAtMonth && education.finishedAtYear && <Text>    </Text>}
					{education.finishedAtMonth && education.finishedAtYear && <Text>To {education.finishedAtMonth}/{education.finishedAtYear}</Text>}
				</Text>
			</View>

			{/* DEGREE */}
			<Text style={tw('text-sm')}>
				{education.degree && <Text>{education.degree}</Text>}
				{education.degree && education.fieldOfStudy && <Text> in </Text>}
				{education.fieldOfStudy && <Text>{education.fieldOfStudy}</Text>}
			</Text>

			{/* DESCRIPTION */}
			{education.description && <Text style={tw('text-sm leading-snug mt-2 pl-6')}>{education.description}</Text>}
		</View>
	)
}

type ExperienceSectionProps = {
	section: ResumeSection & {type: ResumeSections.EXPERIENCE, data: typeof experiences.$inferSelect}
	previousSectionType?: ResumeSections
}

const ExperienceSection = ({section, previousSectionType}: ExperienceSectionProps) => {
	const {data: experience} = section

	return (
		<View style={tw('flex flex-col items-stretch')}>
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EXPERIENCE && <View style={tw('mt-8 mb-3')}>
				<Text style={tw('text-xl font-bold leading-normal')}>Experience</Text>

				{/* DIVIDER */}
				<Divider />
			</View>}

			{/* COMPANY & DATES */}
			<View style={tw('w-full flex flex-row items-center justify-between gap-4')}>
				{/* COMPANY */}
				<Text>
					{experience?.companyName && <Text style={tw('text-lg leading-normal')}>{experience.companyName}</Text>}
					{experience?.companyName && experience?.country && <Text style={tw('text-lg leading-normal')}>, </Text>}
					{experience?.country && <Text style={tw('text-lg leading-normal')}>{experience.country}</Text>}
				</Text>

				<Text style={tw('text-sm')}>
					{experience.startedFromMonth && experience.startedFromYear && <Text>From {experience.startedFromMonth}/{experience.startedFromYear}</Text>}
					{experience.startedFromMonth && experience.startedFromYear && experience.finishedAtMonth && experience.finishedAtYear && <Text>    </Text>}
					{experience.finishedAtMonth && experience.finishedAtYear && <Text>To {experience.finishedAtMonth}/{experience.finishedAtYear}</Text>}
				</Text>
			</View>

			{/* DEGREE */}
			<Text style={tw('text-sm')}>
				{experience.jobTitle && <Text>{experience.jobTitle}</Text>}
				{experience.jobTitle && experience.employmentType && <Text>, </Text>}
				{experience.jobTitle && <Text>{experience.employmentType}</Text>}
			</Text>

			{/* DESCRIPTION */}
			{experience.description && <Text style={tw('text-sm leading-snug mt-2 pl-6')}>{experience.description}</Text>}
		</View>
	)
}
