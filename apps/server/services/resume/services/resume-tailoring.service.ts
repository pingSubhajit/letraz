/**
 * Resume Tailoring Service
 * AI-powered resume tailoring with parallel section generation
 *
 * Uses Vercel AI SDK with multi-provider support (OpenAI, Anthropic, Gemini)
 * Generates all sections in parallel using Promise.all for optimal performance
 */

import {generateObject} from 'ai'
import {z} from 'zod'
import log from 'encore.dev/log'
import {AI_CONFIG, getAIModel} from './ai-provider.config'
import type {Job} from '@/services/job/interface'
import type {ResumeResponse} from '@/services/resume/interface'
import {ResumeSectionType} from '@/services/resume/schema'

/**
 * Zod Schemas for Section Generation
 */

// Experience Schema
const ExperienceSchema = z.object({
	company_name: z.string().describe('Company name'),
	job_title: z.string().describe('Job title/position'),
	employment_type: z
		.enum(['flt', 'prt', 'con', 'int', 'fre', 'sel', 'vol', 'tra'])
		.describe('Employment type: flt=Full Time, prt=Part Time, con=Contract, int=Internship, fre=Freelance, sel=Self-Employed, vol=Volunteer, tra=Trainee'),
	city: z.string().nullable().describe('City location'),
	country_code: z.string().nullable().describe('Country code (e.g., USA, IND)'),
	started_from_month: z.number().min(1).max(12).nullable(),
	started_from_year: z.number().min(1900).max(2100).nullable(),
	finished_at_month: z.number().min(1).max(12).nullable(),
	finished_at_year: z.number().min(1).max(2100).nullable(),
	current: z.boolean().describe('Whether this is current employment'),
	description: z
		.string()
		.describe(
			'Tailored description emphasizing relevant achievements and responsibilities for the target job. Use HTML bullet list with TipTap format: <ul class="list-node"><li><p class="text-node">First point</p></li><li><p class="text-node">Second point</p></li></ul>'
		)
})

// Education Schema
const EducationSchema = z.object({
	institution_name: z.string().describe('Educational institution name'),
	field_of_study: z.string().describe('Field of study or major'),
	degree: z.string().nullable().describe('Degree obtained'),
	country_code: z.string().nullable().describe('Country code'),
	started_from_month: z.number().min(1).max(12).nullable(),
	started_from_year: z.number().min(1900).max(2100).nullable(),
	finished_at_month: z.number().min(1).max(12).nullable(),
	finished_at_year: z.number().min(1900).max(2100).nullable(),
	current: z.boolean().describe('Whether currently studying'),
	description: z
		.string()
		.nullable()
		.describe('Relevant coursework, projects, or achievements related to target job. Format as HTML bullet list with TipTap format: <ul class="list-node"><li><p class="text-node">Point</p></li></ul>. Keep null if no description in original data.')
})

// Skill Schema
const SkillSchema = z.object({
	name: z.string().describe('Skill name'),
	category: z.string().nullable().describe('Skill category (e.g., Programming, Tools, Languages)'),
	level: z
		.enum(['BEG', 'INT', 'ADV', 'EXP'])
		.nullable()
		.describe('Proficiency level: BEG=Beginner, INT=Intermediate, ADV=Advanced, EXP=Expert')
})

// Project Schema
const ProjectSchema = z.object({
	name: z.string().describe('Project name'),
	category: z.string().nullable().describe('Project category'),
	description: z.string().nullable().describe('Tailored project description highlighting relevance to job as HTML bullet list with TipTap format: <ul class="list-node"><li><p class="text-node">Point</p></li></ul>'),
	role: z.string().nullable().describe('Your role in the project'),
	github_url: z.string().nullable().describe('GitHub repository URL'),
	live_url: z.string().nullable().describe('Live demo URL'),
	started_from_month: z.number().min(1).max(12).nullable(),
	started_from_year: z.number().min(1900).max(2100).nullable(),
	finished_at_month: z.number().min(1).max(12).nullable(),
	finished_at_year: z.number().min(1900).max(2100).nullable(),
	current: z.boolean().nullable().describe('Whether currently working on this')
})

// Certification Schema
const CertificationSchema = z.object({
	name: z.string().describe('Certification name'),
	issuing_organization: z.string().nullable().describe('Organization that issued the certification'),
	issue_date: z.string().nullable().describe('Issue date in YYYY-MM-DD format'),
	credential_url: z.string().nullable().describe('URL to verify credential')
})

// Complete Tailored Resume Schema
const TailoredResumeSchema = z.object({
	experiences: z.array(ExperienceSchema).describe('Tailored work experiences'),
	educations: z.array(EducationSchema).describe('Tailored education entries'),
	skills: z.array(SkillSchema).describe('Relevant skills for the job'),
	projects: z.array(ProjectSchema).describe('Relevant projects showcasing skills'),
	certifications: z.array(CertificationSchema).describe('Relevant certifications')
})

/**
 * Section-specific schemas for parallel generation
 */
const ExperiencesSectionSchema = z.object({
	experiences: z
		.array(ExperienceSchema)
		.describe('Work experiences tailored to emphasize job-relevant achievements')
})

const EducationsSectionSchema = z.object({
	educations: z
		.array(EducationSchema)
		.describe('Education entries highlighting relevant coursework and achievements')
})

const SkillsSectionSchema = z.object({
	skills: z.array(SkillSchema).describe('Skills matching job requirements, prioritized by relevance')
})

const ProjectsSectionSchema = z.object({
	projects: z.array(ProjectSchema).describe('Projects demonstrating relevant skills and experience')
})

const CertificationsSectionSchema = z.object({
	certifications: z.array(CertificationSchema).describe('Certifications relevant to the job requirements')
})

/**
 * Resume Tailoring Service
 */
export class ResumeTailoringService {
	/**
	 * Tailor a resume for a specific job using parallel AI generation
	 *
	 * @param baseResume The user's base resume
	 * @param job The target job posting
	 * @returns Tailored sections to replace in the resume
	 */
	static async tailorResume(baseResume: ResumeResponse, job: Job) {
		const startTime = Date.now()

		log.info('Starting parallel resume tailoring', {
			resume_id: baseResume.id,
			job_id: job.id,
			job_title: job.title,
			company: job.company_name,
			provider: AI_CONFIG.provider,
			model_tier: AI_CONFIG.modelTier
		})

		// Extract existing sections from base resume
		const existingData = this.extractExistingSections(baseResume)

		// Build context strings for each section
		const jobContext = this.buildJobContext(job)

		// Generate all sections in parallel using Promise.all
		const [experiencesResult, educationsResult, skillsResult, projectsResult, certificationsResult] =
			await Promise.all([
				this.generateExperiences(existingData.experiences, jobContext),
				this.generateEducations(existingData.educations, jobContext),
				this.generateSkills(existingData.skills, jobContext),
				this.generateProjects(existingData.projects, jobContext),
				this.generateCertifications(existingData.certifications, jobContext)
			])

		const processingTime = Date.now() - startTime

		log.info('Parallel resume tailoring completed', {
			resume_id: baseResume.id,
			job_id: job.id,
			processing_time_ms: processingTime,
			sections_generated: {
				experiences: experiencesResult.experiences.length,
				educations: educationsResult.educations.length,
				skills: skillsResult.skills.length,
				projects: projectsResult.projects.length,
				certifications: certificationsResult.certifications.length
			}
		})

		// Convert to section format for database insertion
		return this.convertToSections(
			experiencesResult,
			educationsResult,
			skillsResult,
			projectsResult,
			certificationsResult
		)
	}

	/**
	 * Extract existing section data from base resume
	 */
	private static extractExistingSections(baseResume: ResumeResponse) {
		const experiences: any[] = []
		const educations: any[] = []
		const skills: any[] = []
		const projects: any[] = []
		const certifications: any[] = []

		for (const section of baseResume.sections) {
			switch (section.type) {
				case ResumeSectionType.Experience:
					if (section.data && !Array.isArray(section.data)) {
						experiences.push(section.data)
					}
					break
				case ResumeSectionType.Education:
					if (section.data && !Array.isArray(section.data)) {
						educations.push(section.data)
					}
					break
				case ResumeSectionType.Skill:
					if (section.data && 'skills' in section.data) {
						skills.push(...(section.data.skills || []))
					}
					break
				case ResumeSectionType.Project:
					if (section.data && !Array.isArray(section.data)) {
						projects.push(section.data)
					}
					break
				case ResumeSectionType.Certification:
					if (section.data && !Array.isArray(section.data)) {
						certifications.push(section.data)
					}
					break
			}
		}

		return {experiences, educations, skills, projects, certifications}
	}

	/**
	 * Build job context string
	 */
	private static buildJobContext(job: Job): string {
		return `
**TARGET JOB:**
- Title: ${job.title}
- Company: ${job.company_name}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description || 'No description provided'}
${job.requirements?.length ? `- Requirements: ${job.requirements.join(', ')}` : ''}
${job.responsibilities?.length ? `- Responsibilities: ${job.responsibilities.join(', ')}` : ''}
${job.benefits?.length ? `- Benefits: ${job.benefits.join(', ')}` : ''}
    `.trim()
	}

	/**
	 * Generate tailored experiences in parallel
	 */
	private static async generateExperiences(existingExperiences: any[], jobContext: string) {
		const model = getAIModel()

		const prompt = `${jobContext}

**TASK:** Tailor the following work experiences to emphasize achievements and responsibilities most relevant to the target job. Use ONLY information from the existing experiences - do not fabricate new companies, roles, or achievements.

**EXISTING EXPERIENCES:**
${JSON.stringify(existingExperiences, null, 2)}

**INSTRUCTIONS:**
- Rewrite descriptions to highlight job-relevant skills and achievements
- Use strong action verbs and quantify results where possible
- Maintain truthfulness - only use information from existing data
- Format descriptions using TipTap HTML structure: <ul class="list-node"><li><p class="text-node">First point</p></li><li><p class="text-node">Second point</p></li></ul>
- Each bullet point MUST be wrapped in <li><p class="text-node">...</p></li> tags
- All bullet points MUST be wrapped in a single <ul class="list-node"> tag
- Keep all dates, companies, and titles accurate
- If no relevant experiences exist, return empty array`

		const result = await generateObject({
			model,
			schema: ExperiencesSectionSchema,
			prompt,
			temperature: AI_CONFIG.temperature
		})

		return result.object
	}

	/**
	 * Generate tailored educations in parallel
	 */
	private static async generateEducations(existingEducations: any[], jobContext: string) {
		const model = getAIModel()

		const prompt = `${jobContext}

**TASK:** Tailor the following education entries to highlight relevant coursework, projects, or achievements related to the target job.

**EXISTING EDUCATION:**
${JSON.stringify(existingEducations, null, 2)}

**INSTRUCTIONS:**
- Keep all institutions, degrees, and dates accurate
- CRITICAL: If an education entry has no description (null), keep it null - DO NOT fabricate or add descriptions
- Only modify existing descriptions to make them more relevant to the job
- If modifying an existing description, format using TipTap HTML structure: <ul class="list-node"><li><p class="text-node">First point</p></li><li><p class="text-node">Second point</p></li></ul>
- Each bullet point MUST be wrapped in <li><p class="text-node">...</p></li> tags
- All bullet points MUST be wrapped in a single <ul class="list-node"> tag
- If no relevant education exists, return the entries as-is`

		const result = await generateObject({
			model,
			schema: EducationsSectionSchema,
			prompt,
			temperature: AI_CONFIG.temperature
		})

		return result.object
	}

	/**
	 * Generate tailored skills in parallel
	 */
	private static async generateSkills(existingSkills: any[], jobContext: string) {
		const model = getAIModel()

		const prompt = `${jobContext}

**TASK:** Filter and prioritize skills from the existing skill list that are most relevant to the target job. Add appropriate proficiency levels.

**EXISTING SKILLS:**
${JSON.stringify(existingSkills, null, 2)}

**INSTRUCTIONS:**
- Prioritize skills mentioned in job requirements
- Only include skills from the existing list - do not add new skills
- Assign appropriate proficiency levels (bgn, int, adv, exp)
- Categorize skills appropriately
- If existing list is empty, return empty array`

		const result = await generateObject({
			model,
			schema: SkillsSectionSchema,
			prompt,
			temperature: AI_CONFIG.temperature
		})

		return result.object
	}

	/**
	 * Generate tailored projects in parallel
	 */
	private static async generateProjects(existingProjects: any[], jobContext: string) {
		const model = getAIModel()

		const prompt = `${jobContext}

**TASK:** Tailor project descriptions to emphasize relevance to the target job.

**EXISTING PROJECTS:**
${JSON.stringify(existingProjects, null, 2)}

**INSTRUCTIONS:**
- Rewrite descriptions to highlight job-relevant technologies and achievements
- Keep project names, URLs, and dates accurate
- Only use information from existing projects
- Format descriptions using TipTap HTML structure: <ul class="list-node"><li><p class="text-node">First point</p></li><li><p class="text-node">Second point</p></li></ul>
- Each bullet point MUST be wrapped in <li><p class="text-node">...</p></li> tags
- All bullet points MUST be wrapped in a single <ul class="list-node"> tag
- Emphasize technical skills that match job requirements
- If no projects exist, return empty array`

		const result = await generateObject({
			model,
			schema: ProjectsSectionSchema,
			prompt,
			temperature: AI_CONFIG.temperature
		})

		return result.object
	}

	/**
	 * Generate tailored certifications in parallel
	 */
	private static async generateCertifications(existingCertifications: any[], jobContext: string) {
		const model = getAIModel()

		const prompt = `${jobContext}

**TASK:** Filter certifications to show only those relevant to the target job.

**EXISTING CERTIFICATIONS:**
${JSON.stringify(existingCertifications, null, 2)}

**INSTRUCTIONS:**
- Only include certifications relevant to job requirements
- Keep all certification details accurate
- Do not modify names, organizations, or dates
- If no certifications exist, return empty array`

		const result = await generateObject({
			model,
			schema: CertificationsSectionSchema,
			prompt,
			temperature: AI_CONFIG.temperature
		})

		return result.object
	}

	/**
	 * Convert generated data to section format for database
	 */
	private static convertToSections(
		experiencesResult: z.infer<typeof ExperiencesSectionSchema>,
		educationsResult: z.infer<typeof EducationsSectionSchema>,
		skillsResult: z.infer<typeof SkillsSectionSchema>,
		projectsResult: z.infer<typeof ProjectsSectionSchema>,
		certificationsResult: z.infer<typeof CertificationsSectionSchema>
	) {
		const sections: Array<{type: ResumeSectionType; data: any}> = []

		// Add experiences
		for (const exp of experiencesResult.experiences) {
			sections.push({
				type: ResumeSectionType.Experience,
				data: exp
			})
		}

		// Add educations
		for (const edu of educationsResult.educations) {
			sections.push({
				type: ResumeSectionType.Education,
				data: edu
			})
		}

		// Add skills (as single section with array)
		if (skillsResult.skills.length > 0) {
			sections.push({
				type: ResumeSectionType.Skill,
				data: {
					skills: skillsResult.skills.map((skill) => ({
						name: skill.name,
						category: skill.category,
						level: skill.level
					}))
				}
			})
		}

		// Add projects
		for (const project of projectsResult.projects) {
			sections.push({
				type: ResumeSectionType.Project,
				data: project
			})
		}

		// Add certifications
		for (const cert of certificationsResult.certifications) {
			sections.push({
				type: ResumeSectionType.Certification,
				data: cert
			})
		}

		return sections
	}
}
