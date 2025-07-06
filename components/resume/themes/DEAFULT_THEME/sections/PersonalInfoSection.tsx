import {Calendar, Globe, Mail, MapPin, Phone} from 'lucide-react'
import {Divider, SectionTitle} from '@/components/resume/themes/DEAFULT_THEME/shared/Components'
import {PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'

const PersonalInfoSection = ({data}: { data: PersonalInfoData }) => {
	return (
		<div className="flex flex-col gap-3 items-center mb-4">
			{/* NAME */}
			<p className="text-3xl font-bold">{data.name.full}</p>

			{/* CONTACT INFO */}
			<div className="w-full flex flex-wrap gap-x-4 gap-y-2 justify-center text-sm">
				{/* EMAIL */}
				{data.contact.email && <div className="flex items-center">
					<Mail className="w-4 h-4 mr-1"/>
					<p>{data.contact.email}</p>
				</div>}

				{/* PHONE */}
				{data.contact.phone && <div className="flex items-center">
					<Phone className="w-4 h-4 mr-1"/>
					<p>{data.contact.phone}</p>
				</div>}

				{/* LOCATION */}
				{data.location.hasLocation && <div className="flex items-center gap-1">
					<MapPin className="w-4 h-4"/>
					<p>{data.location.formatted}</p>
				</div>}

				{/* DOB */}
				{data.dateOfBirth.hasDate && <div className="flex items-center">
					<Calendar className="w-4 h-4 mr-1"/>
					<p>{data.dateOfBirth.formatted}</p>
				</div>}

				{/* WEBSITE */}
				{data.contact.website && <div className="flex items-center">
					<Globe className="w-4 h-4 mr-1"/>
					<p>{data.contact.website}</p>
				</div>}
			</div>

			{/* PROFILE */}
			{data.profile.hasProfile && <div className="w-full">
				{/* TITLE */}
				<div>
					<SectionTitle>Summary</SectionTitle>

					{/* DIVIDER */}
					<Divider className="mb-1.5" />
				</div>
				<div
					className="text-justify leading-snug text-sm"
					dangerouslySetInnerHTML={{__html: data.profile.sanitizedText || ''}}
				/>
			</div>}
		</div>
	)
}

export default PersonalInfoSection
