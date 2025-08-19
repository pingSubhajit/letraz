import '../fontawesome'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEnvelope, faGlobe, faPhoneFlip} from '@fortawesome/free-solid-svg-icons'
import {PersonalInfoData} from '@/components/resume/controllers/PersonalInfoController'
import {cn} from '@/lib/utils'

const PersonalInfoSection = ({data}: { data: PersonalInfoData }) => {
	return (
		<div
			className={cn(
				charter.className,
				'personal-info-section',
				' transition-all duration-300'
			)}
			data-resume-item="personal-info"
		>
			{/* HEADER */}
			<div className="header">
				{/* NAME */}
				<div className="name">
					{data.name.full}
				</div>

				{/* CONTACT INFO */}
				<div className="contact-info">
					{(() => {
						const contactItems = []
						
						if (data.location.hasLocation) {
							contactItems.push(
								<span key="location">
									<FontAwesomeIcon icon={faGlobe} /> {data.location.formatted}
								</span>
							)
						}
						
						if (data.contact.email) {
							contactItems.push(
								<span key="email">
									<FontAwesomeIcon icon={faEnvelope} /> {data.contact.email}
								</span>
							)
						}
						
						if (data.contact.phone) {
							contactItems.push(
								<span key="phone">
									<FontAwesomeIcon icon={faPhoneFlip} /> {data.contact.phone}
								</span>
							)
						}
						
						return contactItems.map((item, index) => (
							<span key={index}>
								{item}
								{index < contactItems.length - 1 && <span className="info-separator">|</span>}
							</span>
						))
					})()}
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
