'use client'

import {personalInfo} from '@/db/personalInfo.schema'
import {ResumeSection, resumeSections, ResumeSections} from '@/db/resumes.schema'
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

const tw = createTw(tailwindConfig) as (input: string) => Style | Style[] | undefined

const DefaultTheme = ({sections, personalInfoData, resumeRef}: {
	sections?: ResumeSection[],
	personalInfoData?: typeof personalInfo.$inferSelect,
	resumeRef?: LegacyRef<any>
}) => {
	return (
		<Document ref={resumeRef}>
			<Page style={tw('absolute p-12')}>
				<PersonalInfo personalInfoData={personalInfoData} />
				{/*{sections?.map((section, i) => (*/}
				{/*	<section key={section.id}>*/}
				{/*		{section.type === ResumeSections.EDUCATION && <EducationSection*/}
				{/*			section={section as any}*/}
				{/*			previousSectionType={sections[i - 1]?.type}*/}
				{/*		/>}*/}
				{/*	</section>*/}
				{/*))}*/}
			</Page>
		</Document>
	)
}

export default DefaultTheme

const Divider = () => <View style={tw('h-[0.5px] bg-primary w-full bg-black')} />

const PersonalInfo = ({personalInfoData}: { personalInfoData?: typeof personalInfo.$inferSelect }) => {
	return (
		<View style={tw('flex flex-col gap-8 items-center')}>
			{/* NAME */}
			<Text style={tw('text-4xl font-bold leading-none')}>{personalInfoData?.firstName} {personalInfoData?.lastName}</Text>

			{/* CONTACT INFO */}
			<View style={tw('w-full flex flex-row flex-wrap m-0 gap-x-4 gap-y-2 flex-wrap justify-center')}>
				{/* EMAIL */}
				{personalInfoData?.email && <View style={tw('flex items-center flex-row')}>
					<MailPDF style={tw('w-5 h-5 m-0 mr-1')} />
					<Text style={tw('text-base leading-none')}>{personalInfoData.email}</Text>
				</View>}

				{/* PHONE */}
				{personalInfoData?.phone && <View style={tw('flex items-center flex-row')}>
					<PhonePDF style={tw('w-4 h-4 m-0 mr-1')} />
					<Text style={tw('text-base leading-none')}>{personalInfoData?.phone}</Text>
				</View>}

				{/* LOCATION */}
				<View style={tw('flex flex-row items-center gap-1 whitespace-nowrap leading-none')}>
					{/* ICON */}
					{/*{(personalInfoData?.address || personalInfoData?.city || personalInfoData?.country || personalInfoData?.postal) &&*/}
					    <MapPinPDF style={tw('w-5 h-5 m-0')} />
					{/*}*/}

					{/* LOCATION INFO */}
					{personalInfoData?.address && <Text style={tw('text-base leading-none')}>{personalInfoData?.address}, </Text>}
					{personalInfoData?.city && <Text style={tw('text-base leading-none')}>{personalInfoData?.city}, </Text>}
					{personalInfoData?.postal && <Text style={tw('text-base leading-none')}>{personalInfoData?.postal}, </Text>}
					{personalInfoData?.country && <Text style={tw('text-base leading-none')}>{personalInfoData?.country}</Text>}
				</View>

				{/* DOB */}
				{personalInfoData?.dob && <View style={tw('flex items-center flex-row')}>
					<CalendarPDF style={tw('w-5 h-5 m-0 mr-1')} />
					<Text style={tw('text-base leading-none')}>{personalInfoData?.dob}</Text>
				</View>}

				{/* WEBSITE */}
				{personalInfoData?.website && <View style={tw('flex items-center flex-row')}>
					<GlobePDF style={tw('w-5 h-5 m-0 mr-1')} />
					<Text style={tw('text-base leading-none')}>{personalInfoData?.website}</Text>
				</View>}
			</View>

			{/* PROFILE */}
			{personalInfoData?.profileText && <Text style={tw('w-full text-justify text-base leading-snug')}>{personalInfoData?.profileText}</Text>}

			{/* DIVIDER */}
			<Divider />
		</View>
	)
}

type EducationSectionProps = {
	section: ResumeSection & {type: ResumeSections.EDUCATION, data: typeof resumeSections.$inferSelect}
	previousSectionType?: ResumeSections
}

const EducationSection = ({section, previousSectionType}: EducationSectionProps) => {
	return (
		<div className="flex flex-col items-stretch">
			{/* TITLE */}
			{previousSectionType !== ResumeSections.EDUCATION && <div className="mt-6">
				<div className="text-xl font-bold">Education</div>

				{/* DIVIDER */}
				<Divider />
			</div>}
			
		</div>
	)
}
