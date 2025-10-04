'use server'

import {generateObject} from 'ai'
import {google} from '@ai-sdk/google'
import {z} from 'zod'
import {ResumeMutationSchema} from '@/lib/resume/types'
import {UserInfoMutationSchema} from '@/lib/user-info/types'

/**
 * Ensure that HTML produced for Tiptap includes our expected classes.
 * - paragraph -> text-node
 * - heading (h1..h6) -> heading-node
 * - blockquote -> block-node
 * - ul/ol -> list-node
 * - code (inline) -> inline
 * If the input is plain text, wrap it in a paragraph with class text-node.
 */
const ALLOWED_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'code'] as const
type AllowedTag = typeof ALLOWED_TAGS[number]

const ensureClassOnTag = (html: string, tag: AllowedTag, className: string): string => {
	if (!ALLOWED_TAGS.includes(tag)) {
		throw new Error(`Tag "${tag}" is not allowed`)
	}
	const regex = new RegExp(`<${tag}\\b([^>]*)>`, 'gi')
	return html.replace(regex, (match, attrs: string) => {
		if (/class\s*=/.test(attrs)) {
			return match.replace(/class\s*=\s*(["'])(.*?)\1/i, (_m, quote: string, classes: string) => {
				const classList = classes.trim().split(/\s+/)
				if (classList.includes(className)) return `class=${quote}${classes}${quote}`
				const updated = classes ? `${classes} ${className}` : className
				return `class=${quote}${updated}${quote}`
			})
		}
		const space = attrs?.length ? attrs : ''
		return `<${tag}${space} class="${className}">`
	})
}

// Normalize certification issue_date to YYYY-MM-DD when possible
const normalizeCertificationDate = (date: unknown): string | null | undefined => {
	if (date === null || date === undefined) return date as null | undefined

	if (date instanceof Date) {
		return date.toISOString().slice(0, 10)
	}

	if (typeof date === 'string') {
		if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
		if (/^\d{4}-\d{2}-\d{2}T/.test(date)) return date.slice(0, 10)

		const parsed = new Date(date)
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toISOString().slice(0, 10)
		}
	}

	return undefined
}

const isLikelyHtml = (input: string): boolean => /<\w+[\s\S]*>/.test(input)

const normalizeDescriptionToTiptapHTML = (input: string | null | undefined): string | null | undefined => {
	if (input == null || input === '') return input

	let html = String(input).trim()

	// If not HTML, convert to a simple paragraph
	if (!isLikelyHtml(html)) {
		// Preserve basic newlines by splitting into paragraphs
		const paragraphs = html
			.split(/\n{2,}/)
			.map(p => p.trim())
			.filter(Boolean)
			.map(p => `<p class="text-node">${p.replace(/\n/g, '<br/>')}</p>`) // single newlines become <br/>
		html = paragraphs.length ? paragraphs.join('') : '<p class="text-node"></p>'
	}

	// Enforce classes on common nodes
	html = ensureClassOnTag(html, 'p', 'text-node')
	html = ensureClassOnTag(html, 'h1', 'heading-node')
	html = ensureClassOnTag(html, 'h2', 'heading-node')
	html = ensureClassOnTag(html, 'h3', 'heading-node')
	html = ensureClassOnTag(html, 'h4', 'heading-node')
	html = ensureClassOnTag(html, 'h5', 'heading-node')
	html = ensureClassOnTag(html, 'h6', 'heading-node')
	html = ensureClassOnTag(html, 'blockquote', 'block-node')
	html = ensureClassOnTag(html, 'ul', 'list-node')
	html = ensureClassOnTag(html, 'ol', 'list-node')
	html = ensureClassOnTag(html, 'code', 'inline')

	return html
}

// Schema for AI parsing - accepts strings for dates (AI can't return Date objects in JSON)
const AIUserInfoMutationSchema = UserInfoMutationSchema.omit({dob: true}).extend({
	dob: z.string().nullable().optional().describe('Date of birth in YYYY-MM-DD format')
})

// Enhanced schema for AI responses that includes both user profile data and resume sections
const EnhancedResumeMutationSchemaForAI = z.object({
	userProfile: AIUserInfoMutationSchema.partial(),
	sections: ResumeMutationSchema.shape.sections
})

// Enhanced schema that includes both user profile data and resume sections (with proper Date types)
const EnhancedResumeMutationSchema = z.object({
	userProfile: UserInfoMutationSchema.partial(),
	sections: ResumeMutationSchema.shape.sections
})

export type EnhancedResumeMutation = z.infer<typeof EnhancedResumeMutationSchema>

// Generic schema for non-proprietary format
const GenericResumeSchema = z.object({
	personalInfo: z.object({
		name: z.string(),
		email: z.string().optional(),
		phone: z.string().optional(),
		location: z.string().optional(),
		summary: z.string().optional()
	}),
	education: z.array(z.object({
		institution: z.string(),
		degree: z.string().optional(),
		field: z.string().optional(),
		startDate: z.string().describe('Use blank string if not found'),
		endDate: z.string().describe('Use blank string if not found'),
		gpa: z.string().optional()
	})),
	experience: z.array(z.object({
		company: z.string(),
		position: z.string(),
		startDate: z.string().describe('Use blank string if not found'),
		endDate: z.string().describe('Use blank string if not found'),
		description: z.string().describe('In a short paragraph, what did the user do in their experience and their impact'),
		location: z.string().optional()
	})),
	skills: z.array(z.string()),
	certifications: z.array(z.object({
		name: z.string(),
		issuer: z.string().optional(),
		date: z.string().optional()
	})),
	projects: z.array(z.object({
		name: z.string(),
		description: z.string(),
		technologies: z.array(z.string()).optional()
	}))
})

export type GenericParsedResume = z.infer<typeof GenericResumeSchema>

export const parseResume = async (
	file: File,
	format: 'proprietary' | 'generic' = 'proprietary'
): Promise<EnhancedResumeMutation | GenericParsedResume> => {
	// Validate input
	if (!file || !(file instanceof File)) {
		throw new Error('Uploaded resume is not a file')
	}

	if (file.size === 0) {
		throw new Error('Uploaded resume is an empty file')
	}

	// For proprietary format, use AI-compatible schema (dates as strings), then transform
	const schema = format === 'proprietary' ? EnhancedResumeMutationSchemaForAI : GenericResumeSchema

	// Choose model based on target format for clarity and maintainability
	const modelId = format === 'proprietary' ? 'gemini-2.5-flash' : 'gemini-2.5-flash'

	const currentYear = new Date().getFullYear()
	const prompt = format === 'proprietary'
		? `You are a strict JSON generator that extracts BOTH personal profile information AND resume sections. Return ONLY JSON matching the schema, no prose.

CRITICAL INSTRUCTIONS FOR USER PROFILE EXTRACTION:
1. ALWAYS extract the person's name from the resume header - split into first_name and last_name
2. ALWAYS look for contact information (email, phone number) typically found at the top of the resume
3. ALWAYS extract location information (address, city, postal code, country) from the contact section
4. Look for LinkedIn/portfolio websites in the contact section
5. Extract any professional summary or objective statement as profile_text
6. If you find a date of birth, return it as an ISO date string in YYYY-MM-DD format
7. Extract nationality if mentioned anywhere in the resume
8. Do NOT leave userProfile fields empty if the information exists in the resume
9. If no profile_text is found in the resume, generate a concise professional profile text that would work well as a LinkedIn summary or resume objective. Focus on their expertise, experience level, and key accomplishments. Return only the profile text, no additional formatting or explanation.

Example userProfile extraction:
If resume shows "John Smith, john.smith@email.com, (555) 123-4567, 123 Main St, New York, NY 10001"
Then userProfile should be:
{
  "first_name": "John",
  "last_name": "Smith", 
  "email": "john.smith@email.com",
  "phone": "(555) 123-4567",
  "address": "123 Main St",
  "city": "New York", 
  "postal": "10001",
  "country": "USA"
}

Rules:
- MANDATORY: Extract personal contact information from resume header/contact section
- Use null for unknown optional values where allowed; otherwise use empty string for required strings when unknown.
- For userProfile.dob, if a date of birth is found, format it as an ISO date string (YYYY-MM-DD).
- For userProfile.country, provide the ISO3 country code string (like "USA", "IND").
- For all month fields (started_from_month, finished_at_month) in Education/Experience sections: return as NUMBER type from 1 to 12 (not string). Do not use month names like "Jul".
- For all year fields (started_from_year, finished_at_year) in Education/Experience sections: return as NUMBER type like 2021 (not string "2021").
- For Project sections only: return month/year fields as STRING type (e.g., "1", "2021"), not numbers.
- Certification issue_date MUST be a date-only string in the exact format YYYY-MM-DD (e.g., "2024-03-01").
- For Education sections: country_code must be a 3-letter uppercase ISO3 code (e.g., "USA", "IND").
- For Experience sections: country_code must be a 3-letter uppercase ISO3 code (e.g., "USA", "IND").
- employment_type must be one of: 'Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance', 'Self Employed', 'Volunteer', 'Trainee'.
- level must be one of: 'Beginner', 'Intermediate', 'Advanced', 'Expert', or omit the field entirely.
- The current calendar year is ${currentYear}. Do NOT output any future years. If you encounter a year greater than ${currentYear} in the source resume:
  - For that date field, set the associated month and year fields to null, and
  - Set the "current" flag to true for that section when available (Education, Experience, Project).
- For every "description" field (Education, Experience, Project), return a Tiptap-compatible HTML string and PREFER BULLETED LISTS:
   - Default to unordered lists for multi-point content: <ul class="list-node"><li>…</li><li>…</li></ul>
   - Use a single paragraph only when the content is one succinct sentence: <p class="text-node">…</p>
   - Allowed classes: paragraphs -> "text-node"; headings h1–h6 -> "heading-node"; blockquotes -> "block-node"; ul/ol -> "list-node"; inline code -> "inline".
   - Do NOT return Markdown; return HTML only with the classes above. Keep list items concise, one idea per <li>.
- Return ONLY JSON. No backticks, no extra text.`
		: `You are a strict JSON generator that parses resumes into structured data. Extract information from the resume and organize it into the following sections: personalInfo, education, experience, skills, certifications, and projects.

CRITICAL FORMATTING REQUIREMENTS:
- Return ONLY raw JSON that matches the schema exactly
- Do NOT wrap your response in markdown code blocks (no \`\`\`json)
- Do NOT include any explanatory text or prose
- Do NOT add any backticks, formatting, or extra characters
- Your response should start with { and end with }

EXTRACTION GUIDELINES:
- Extract personal information (name, email, phone, location, summary) from the resume header
- List all educational institutions with degrees, fields, dates, and GPA if available
- Include all work experience with company, position, dates, description, and location
- Extract all technical and soft skills mentioned
- Include certifications with name, issuer, and date if available
- List projects with name, description, and technologies used
- Use empty string for missing required fields, null for optional fields when not found
- Format dates as strings (e.g., "Jan 2024", "2019-2023")

Return ONLY the JSON object, nothing else.`

	// Convert file to data URL format as required by AI SDK
	const arrayBuffer = await file.arrayBuffer()

	try {
		const result = await generateObject({
			model: google(modelId),
			schema,
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: prompt
						},
						{
							type: 'file',
							data: arrayBuffer,
							mediaType: file.type
						}
					]
				}
			],
			temperature: 0, // More deterministic, faster
			output: 'object'
		})

		// Normalize any date-time strings to date-only for certification issue_date
		if (format === 'proprietary') {
			const payload = result.object as z.infer<typeof EnhancedResumeMutationSchemaForAI>

			// Transform userProfile.dob from ISO string to Date object
			const transformedPayload: EnhancedResumeMutation = {
				...payload,
				userProfile: {
					...payload.userProfile,
					dob: payload.userProfile?.dob ? new Date(payload.userProfile.dob) : undefined
				}
			}

			for (const section of transformedPayload.sections) {
				if (section.type === 'Certification') {
					section.data.issue_date = normalizeCertificationDate(section.data.issue_date)
				}

				// Normalize description fields to Tiptap-compatible HTML
				if (section.type === 'Education') {
					section.data.description = normalizeDescriptionToTiptapHTML(section.data.description)
					// Clamp future dates and set current flag when needed
					const sYear = typeof section.data.started_from_year === 'string' ? parseInt(section.data.started_from_year, 10) : NaN
					const fYear = typeof section.data.finished_at_year === 'string' ? parseInt(section.data.finished_at_year, 10) : NaN
					if (!Number.isNaN(sYear) && sYear > currentYear) {
						section.data.started_from_year = null
						section.data.started_from_month = null
						section.data.current = true
					}
					if (!Number.isNaN(fYear) && fYear > currentYear) {
						section.data.finished_at_year = null
						section.data.finished_at_month = null
						section.data.current = true
					}
				}
				if (section.type === 'Experience') {
					section.data.description = normalizeDescriptionToTiptapHTML(section.data.description)
					// Clamp future dates and set current flag when needed
					const sYear = typeof section.data.started_from_year === 'string' ? parseInt(section.data.started_from_year, 10) : NaN
					const fYear = typeof section.data.finished_at_year === 'string' ? parseInt(section.data.finished_at_year, 10) : NaN
					if (!Number.isNaN(sYear) && sYear > currentYear) {
						section.data.started_from_year = null
						section.data.started_from_month = null
						section.data.current = true
					}
					if (!Number.isNaN(fYear) && fYear > currentYear) {
						section.data.finished_at_year = null
						section.data.finished_at_month = null
						section.data.current = true
					}
				}
				if (section.type === 'Project') {
					section.data.description = normalizeDescriptionToTiptapHTML(section.data.description)
					// Clamp future dates and set current flag when needed
					const sYear = typeof section.data.started_from_year === 'string' ? parseInt(section.data.started_from_year, 10) : NaN
					const fYear = typeof section.data.finished_at_year === 'string' ? parseInt(section.data.finished_at_year, 10) : NaN
					if (!Number.isNaN(sYear) && sYear > currentYear) {
						section.data.started_from_year = null
						section.data.started_from_month = null
						section.data.current = true
					}
					if (!Number.isNaN(fYear) && fYear > currentYear) {
						section.data.finished_at_year = null
						section.data.finished_at_month = null
						section.data.current = true
					}
				}
			}
			return transformedPayload
		}

		return result.object as GenericParsedResume | EnhancedResumeMutation
	} catch (error) {
		// Log detailed error information for debugging
		console.error('Resume parsing error:', error)
		if (error && typeof error === 'object' && 'cause' in error) {
			console.error('Error cause:', error.cause)
		}
		throw new Error(`Failed to parse resume: ${(error as Error).message}`)
	}
}
