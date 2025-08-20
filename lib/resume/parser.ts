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

// Enhanced schema that includes both user profile data and resume sections
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

export const parseResume = async (
	file: File,
	format: 'proprietary' | 'generic' = 'proprietary'
): Promise<EnhancedResumeMutation | any> => {
	// Validate input
	if (!file || !(file instanceof File)) {
		throw new Error('Uploaded resume is not a file')
	}

	if (file.size === 0) {
		throw new Error('Uploaded resume is an empty file')
	}

	// For proprietary format, output exactly our internal ResumeMutation schema + user profile
	const schema = format === 'proprietary' ? EnhancedResumeMutationSchema : GenericResumeSchema

	const currentYear = new Date().getFullYear()
	const prompt = format === 'proprietary'
		? `You are a strict JSON generator that extracts BOTH personal profile information AND resume sections. Return ONLY JSON matching the schema, no prose.

CRITICAL INSTRUCTIONS FOR USER PROFILE EXTRACTION:
1. ALWAYS extract the person's name from the resume header - split into first_name and last_name
2. ALWAYS look for contact information (email, phone number) typically found at the top of the resume
3. ALWAYS extract location information (address, city, postal code, country) from the contact section
4. Look for LinkedIn/portfolio websites in the contact section
5. Extract any professional summary or objective statement as profile_text
6. If you find a date of birth, format it as an ISO date string (YYYY-MM-DD)
7. Extract nationality if mentioned anywhere in the resume
8. Do NOT leave userProfile fields empty if the information exists in the resume
9. If not profile_text is found in the resume gGenerate a concise professional profile text that would work well as a LinkedIn summary or resume objective. Focus on their expertise, experience level, and key accomplishments. Return only the profile text, no additional formatting or explanation.

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
- For userProfile.country, provide the ISO# code (like "USA", "IND").
- Months MUST be numeric strings from "1" to "12" (do not use names like "Jul").
- Years MUST be 4-digit numeric strings like "2021".
- Certification issue_date MUST be a date-only string in the exact format YYYY-MM-DD (e.g., "2024-03-01").
- Use ISO3 country codes (e.g., USA, IND) when inferring countries.
- employment_type must be one of: flt, prt, con, int, fre, sel, vol, tra.
- level must be one of: BEG, INT, ADV, EXP, or null.
- The current calendar year is ${currentYear}. Do NOT output any future years. If you encounter a year greater than ${currentYear} in the source resume:
  - For that date field, set the associated month and year fields to null, and
  - Set the "current" flag to true for that section when available (Education, Experience, Project).
- For every "description" field (Education, Experience, Project), return a Tiptap-compatible HTML string and PREFER BULLETED LISTS:
   - Default to unordered lists for multi-point content: <ul class="list-node"><li>…</li><li>…</li></ul>
   - Use a single paragraph only when the content is one succinct sentence: <p class="text-node">…</p>
   - Allowed classes: paragraphs -> "text-node"; headings h1–h6 -> "heading-node"; blockquotes -> "block-node"; ul/ol -> "list-node"; inline code -> "inline".
   - Do NOT return Markdown; return HTML only with the classes above. Keep list items concise, one idea per <li>.
- Return ONLY JSON. No backticks, no extra text.`
		: 'Parse resume into: personalInfo, education, experience, skills, certifications, projects. Only return the JSON response. Do not include any additional texts, backticks or artifacts.'

	// Convert file to data URL format as required by AI SDK
	const arrayBuffer = await file.arrayBuffer()

	try {
		const result = await generateObject({
			model: google('gemini-2.5-flash-lite'),
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
			// Add performance optimizations
			temperature: 0 // More deterministic, faster
		})

		// Normalize any date-time strings to date-only for certification issue_date
		if (format === 'proprietary') {
			const payload = result.object as z.infer<typeof EnhancedResumeMutationSchema>
			for (const section of payload.sections) {
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
			return payload
		}

		return result.object
	} catch (error) {
		throw new Error(`Failed to parse resume: ${(error as Error).message}`)
	}
}
