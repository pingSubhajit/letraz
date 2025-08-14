'use server'

import {generateObject} from 'ai'
import {google} from '@ai-sdk/google'
import {z} from 'zod'
import {ResumeMutation, ResumeMutationSchema} from '@/lib/resume/types'

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
): Promise<any> => {
	// Validate input
	if (!file || !(file instanceof File)) {
		throw new Error('Uploaded resume is not a file')
	}

	if (file.size === 0) {
		throw new Error('Uploaded resume is an empty file')
	}

	// For proprietary format, output exactly our internal ResumeMutation schema
	const schema = format === 'proprietary' ? ResumeMutationSchema : GenericResumeSchema

	const currentYear = new Date().getFullYear()
	const prompt = format === 'proprietary'
		? `You are a strict JSON generator. Return ONLY JSON matching this schema, no prose:
{
  "sections": [
    { "type": "Education", "data": { "institution_name": string, "field_of_study": string, "degree": string|null, "country": string(ISO3), "started_from_month": string(1-12)|null|undefined, "started_from_year": string(YYYY)|null|undefined, "finished_at_month": string(1-12)|null|undefined, "finished_at_year": string(YYYY)|null|undefined, "current": boolean, "description": string|null } },
    { "type": "Experience", "data": { "company_name": string, "job_title": string, "country": string(ISO3), "city": string|null, "employment_type": "flt"|"prt"|"con"|"int"|"fre"|"sel"|"vol"|"tra", "started_from_month": string(1-12)|null|undefined, "started_from_year": string(YYYY)|null|undefined, "finished_at_month": string(1-12)|null|undefined, "finished_at_year": string(YYYY)|null|undefined, "current": boolean, "description": string|null } },
    { "type": "Skill", "data": { "skills": [ { "name": string, "level": "BEG"|"INT"|"ADV"|"EXP"|null, "category": string|null|undefined } ] } },
    { "type": "Project", "data": { "name": string, "category": string|null, "description": string|null, "role": string|null, "github_url": string|null, "live_url": string|null, "started_from_month": string(1-12)|null|undefined, "started_from_year": string(YYYY)|null|undefined, "finished_at_month": string(1-12)|null|undefined, "finished_at_year": string(YYYY)|null|undefined, "current": boolean|null, "skills_used": [ { "name": string, "category": string|null } ] } },
    { "type": "Certification", "data": { "name": string, "issuing_organization": string|undefined, "issue_date": string(YYYY-MM-DD) | null | undefined, "credential_url": string|null } }
  ]
}

Rules:
- Use null for unknown optional values where allowed; otherwise use empty string for required strings when unknown.
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
			const payload = result.object as ResumeMutation
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
