import '../fontawesome'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {CertificationData} from '@/components/resume/controllers/CertificationController'


// Certification Section UI Component
const CertificationSection = ({data}: { data: CertificationData }) => {
	// Error handling for missing certification name
	if (!data.name) {
		return null
	}

	return (
		<article
			className={`${charter.className} certification-item ${data.spacing.marginTop ? 'mt-2' : ''}`}
			aria-label={`Certification: ${data.name}`}
			data-resume-item={`certification-${data.id}`}
		>
			{/* CERTIFICATION HEADER */}
			<div className="certification-header">
				{/* CERTIFICATION NAME */}
				<h3 className="certification-title">{data.name}</h3>

				{/* CERTIFICATION DATE */}
				{data.issueDate.hasDate && data.issueDate.formatted && (
					<time className="certification-date" aria-label="Issue date">{data.issueDate.formatted}</time>
				)}
			</div>

			{/* ISSUING ORGANIZATION AND CREDENTIAL LINK */}
			{(data.issuingOrganization.hasOrganization || data.credentialUrl.hasUrl) && (
				<div className="certification-subtitle">
					{data.issuingOrganization.hasOrganization && data.issuingOrganization.value && (
						<span className="certification-organization">{data.issuingOrganization.value}</span>
					)}
					{data.credentialUrl.hasUrl && data.credentialUrl.value && (
						<span className="certification-links" role="group" aria-label="Certification links">
							{data.issuingOrganization.hasOrganization && <span className="certification-separator" aria-hidden="true">|</span>}
							<a
								href={data.credentialUrl.value}
								target="_blank"
								rel="noopener noreferrer"
								className="certification-link"
								aria-label={`View ${data.name} credential`}
							>
								View Certificate
							</a>
						</span>
					)}
				</div>
			)}
		</article>
	)
}

export default CertificationSection
