import {personalInfo} from '@/db/personalInfo.schema'
import {Calendar, Globe, Mail, MapPin, Phone} from 'lucide-react'
import {Divider, SectionTitle} from '../shared/Components'

const PersonalInfoSection = ({personalInfoData}: { personalInfoData?: typeof personalInfo.$inferSelect }) => {
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

export default PersonalInfoSection
