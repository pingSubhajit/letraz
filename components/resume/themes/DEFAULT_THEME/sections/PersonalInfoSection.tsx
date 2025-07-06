import '../fontawesome'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEnvelope, faGlobe, faPhoneFlip} from '@fortawesome/free-solid-svg-icons'
import {PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'

const PersonalInfoSection = ({data}: { data: PersonalInfoData }) => {
	return (
		<div className={charter.className}>
			{/* HEADER */}
			<div className="header">
				{/* NAME */}
				<div className="name">
					{data.name.full}
				</div>

				{/* CONTACT INFO */}
				<div className="contact-info">
					{data.location.hasLocation && (
						<>
							<span>
								<FontAwesomeIcon icon={faGlobe} /> {data.location.formatted}
							</span>
							<span className="info-separator">|</span>
						</>
					)}

					{data.contact.email && (
						<>
							<span>
								<FontAwesomeIcon icon={faEnvelope} /> {data.contact.email}
							</span>
							<span className="info-separator">|</span>
						</>
					)}

					{data.contact.phone && (
						<span>
							<FontAwesomeIcon icon={faPhoneFlip} /> {data.contact.phone}
						</span>
					)}
				</div>

				{/* SOCIAL INFO */}
				{data.contact.website && (
					<div className="social-info">
						<span>
							<FontAwesomeIcon icon={faGlobe} /> {data.contact.website}
						</span>
					</div>
				)}
			</div>

			{/* PROFILE SECTION */}
			{data.profile.hasProfile && (
				<div className="section">
					<div className="section-header">
						Profile
					</div>
					<div
						className="profile-text"
						dangerouslySetInnerHTML={{__html: data.profile.sanitizedText || ''}}
					/>
				</div>
			)}
		</div>
	)
}

export default PersonalInfoSection
