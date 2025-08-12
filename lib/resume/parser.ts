'use server'

import {generateObject} from 'ai'
import {google} from '@ai-sdk/google'
import {z} from 'zod'
import {ResumeMutation, ResumeMutationSchema} from '@/lib/resume/types'

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
- skill_id should be "custom:<skill name>" if not a known global id.
- level must be one of: BEG, INT, ADV, EXP, or null.
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
					const d: unknown = section.data.issue_date
					if (d instanceof Date) {
						const iso = d.toISOString()
						section.data.issue_date = iso.slice(0, 10)
					} else if (typeof d === 'string') {
						// If it includes a time component, strip to date-only
						if (/^\d{4}-\d{2}-\d{2}T/.test(d)) {
							section.data.issue_date = d.slice(0, 10)
						} else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
							// already date-only, keep as is
							section.data.issue_date = d
						} else {
							// Try to parse looser formats and convert
							const parsed = new Date(d)
							if (!Number.isNaN(parsed.getTime())) {
								section.data.issue_date = parsed.toISOString().slice(0, 10)
							} else {
								// Unknown format -> clear the field (optional)
								section.data.issue_date = undefined as unknown as never
							}
						}
					} else if (d === null || d === undefined) {
						// leave as-is (allowed)
					}
				}
			}
			return payload
		}

		return result.object
	} catch (error) {
		console.log(error)
		throw new Error(`Failed to parse resume: ${(error as Error).message}`)
	}
}
