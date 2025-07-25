import '../fontawesome'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {ProjectData} from '@/components/resume/controllers/ProjectController'

// Project Section UI Component
const ProjectsSection = ({data}: { data: ProjectData }) => {
	// Error handling for missing project name
	if (!data.name) {
		return null
	}

	return (
		<article className={`${charter.className} project-item ${data.spacing.marginTop ? 'mt-2' : ''}`} aria-label={`Project: ${data.name}`}>
			{/* PROJECT HEADER */}
			<div className="project-header">
				{/* PROJECT NAME AND CATEGORY */}
				<h3 className="project-title">
					{data.name}
					{data.category.hasCategory && (
						<span className="project-category"> – {data.category.value}</span>
					)}
				</h3>

				{/* PROJECT DATE */}
				{data.dates.hasDates && (
					<time className="project-date" aria-label="Project duration">{data.dates.formatted}</time>
				)}
			</div>

			{/* PROJECT ROLE AND LINKS */}
			<div className="project-subtitle">
				{data.role.hasRole && (
					<span className="project-role">{data.role.value}</span>
				)}
				{data.links.hasLinks && (
					<span className="project-links" role="group" aria-label="Project links">
						{data.role.hasRole && <span aria-hidden="true"> | </span>}
						{data.links.github && (
							<>
								<a
									href={data.links.github}
									target="_blank"
									rel="noopener noreferrer"
									className="project-link"
									aria-label={`View ${data.name} on GitHub`}
								>
									<FontAwesomeIcon icon={faGithub} aria-hidden="true" />
									<span> GitHub</span>
								</a>
								{data.links.live && <span aria-hidden="true"> | </span>}
							</>
						)}
						{data.links.live && (
							<a
								href={data.links.live}
								target="_blank"
								rel="noopener noreferrer"
								className="project-link"
								aria-label={`View ${data.name} live demo`}
							>
								Live Demo
							</a>
						)}
					</span>
				)}
			</div>

			{/* PROJECT TECHNOLOGIES */}
			{data.technologies.hasTechnologies && (
				<div className="project-technologies">
					<span className="tech-label">Skills used: </span>
					<span className="tech-list">{data.technologies.list.join(', ')}</span>
				</div>
			)}

			{/* PROJECT DESCRIPTION */}
			{data.description.hasDescription && (
				<div
					className="project-details"
					dangerouslySetInnerHTML={{__html: data.description.sanitizedHtml || ''}}
				/>
			)}

		</article>
	)
}

export default ProjectsSection
