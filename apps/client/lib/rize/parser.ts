'use server'

import {z} from 'zod'
import {generateObject} from 'ai'
import {google} from '@ai-sdk/google'
import {RizeUserSchema} from '@/lib/rize/types'
import {ResumeMutationSchema} from '@/lib/resume/types'
import {UserInfoMutationSchema} from '@/lib/user-info/types'

// Mirror the proprietary EnhancedResumeMutation schema used by resume/parser.ts
const EnhancedResumeMutationSchema = z.object({
	userProfile: UserInfoMutationSchema.partial(),
	sections: ResumeMutationSchema.shape.sections
})

export type EnhancedResumeMutation = z.infer<typeof EnhancedResumeMutationSchema>

// Utilities to normalize description fields into Tiptap-compatible HTML, mirroring resume/parser.ts
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

const isLikelyHtml = (input: string): boolean => /<\w+[\s\S]*>/.test(input)

const normalizeDescriptionToTiptapHTML = (input: string | null | undefined): string | null | undefined => {
	if (input == null || input === '') return input

	let html = String(input).trim()

	// If not HTML, prefer unordered list when multiple points are present, else a single paragraph
	if (!isLikelyHtml(html)) {
		const lines = html.split(/\n+/).map(l => l.trim()).filter(Boolean)
		if (lines.length > 1) {
			const items = lines.map(item => `<li>${item}</li>`).join('')
			html = `<ul class="list-node">${items}</ul>`
		} else {
			html = `<p class="text-node">${html}</p>`
		}
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

export const parseRizeUserToEnhancedResume = async (payload: unknown): Promise<EnhancedResumeMutation> => {
	const data = RizeUserSchema.parse(payload)
	const prompt = `You are a strict JSON generator that transforms a Rize user JSON into our proprietary resume payload. Return ONLY JSON matching the schema, no prose.

TARGET SHAPE:
{
  "userProfile": UserInfoMutation,
  "sections": ResumeSectionMutation[]
}

MANDATORY NORMALIZATION RULES:
0) PRIMARY PROFILE: Use the first element of user.profiles[] as the primary profile when present.
1) Name splitting (MANDATORY when name or displayName exists): Prefer primary.displayName; if absent use user.name. Split into first_name (first token) and last_name (rest joined). If any is missing, omit it.
2) userProfile (MANDATORY when data exists):
   - email: from user.email
   - website: from primary.website
   - profile_text: from primary.bio (concise summary, no markdown)
   - country: infer ISO3 from primary.location when possible (e.g., "Mumbai, India" -> "IND", "NY, USA" -> "USA"); if unsure, omit
   - address, city, postal: omit (do not guess)
   - Do NOT omit userProfile if any of the above values exist.
3) Education (for each profile.education):
   - type: "Education"
   - data.institution_name: school (default "")
   - data.field_of_study: fieldOfStudy (default "")
   - data.degree: degree (string|null)
   - data.country: "USA"
   - data.started_from_month/year and finished_at_month/year: derive from startDate/endDate (month as "1".."12", year as "YYYY"); set null if invalid
   - data.current: true if endDate is null
   - data.description: description or null
4) Experience (for each profile.experience):
   - type: "Experience"
   - data.employer: company (default "")
   - data.title: title (default "")
   - data.city: null
   - data.country: "USA"
   - data.employment_type: map employmentType to codes: Full-time->"flt", Part-time->"prt", Contract->"con", Internship->"int", Freelance->"fre", Self-employed->"sel", Volunteer->"vol", Trainee->"tra". Default to "flt" if unknown.
   - dates: as in Education
   - data.current: true if endDate is null, else use currentlyWorking
   - data.description: description or null
5) Projects (for each profile.projects):
   - type: "Project"
   - data.title: name (default "")
   - data.role: null
   - data.project_url: url or null
   - dates/current: as above
   - data.description: description or null
6) Description fields MUST be Tiptap-compatible HTML. Prefer concise bullet lists when multiple points exist:
   - Use <ul class="list-node"><li>…</li></ul> for multi-point content
   - Use a single paragraph only when a list is not meaningful: <p class="text-node">…</p>
   - Allowed classes: paragraphs -> "text-node"; headings h1–h6 -> "heading-node"; blockquotes -> "block-node"; ul/ol -> "list-node"; inline code -> "inline"
   - Do NOT use Markdown; return HTML only with the classes above.
7) Use null for unknown optional values; use empty string for required strings when unknown.
8) Return ONLY JSON. No markdown, no extra characters.

EXAMPLE (illustrative):
INPUT (abridged):
{"name":"Jane Doe","email":"jane@example.com","profiles":[{"displayName":"Jane Doe","bio":"Engineer with impact...","location":"NY, USA","website":"https://jane.dev"}]}
OUTPUT userProfile:
{"first_name":"Jane","last_name":"Doe","email":"jane@example.com","website":"https://jane.dev","profile_text":"Engineer with impact...","country":"USA"}
`

	try {
		const result = await generateObject({
			model: google('gemini-2.5-flash-lite'),
			schema: EnhancedResumeMutationSchema,
			messages: [
				{
					role: 'user',
					content: [
						{type: 'text', text: prompt},
						{type: 'text', text: JSON.stringify(data)}
					]
				}
			],
			temperature: 0,
			maxRetries: 2
		})

		// Normalize description fields to ensure Tiptap-compatible HTML
		const payloadOut = result.object
		for (const section of payloadOut.sections) {
			if (section.type === 'Education') {
				section.data.description = normalizeDescriptionToTiptapHTML(section.data.description)
			}
			if (section.type === 'Experience') {
				section.data.description = normalizeDescriptionToTiptapHTML(section.data.description)
			}
			if (section.type === 'Project') {
				section.data.description = normalizeDescriptionToTiptapHTML(section.data.description)
			}
		}

		// Deterministic enrichment for userProfile when LLM omits known values
		try {
			const primary = Array.isArray(data.profiles) && data.profiles.length > 0 ? data.profiles[0] : undefined
			const before = JSON.stringify(payloadOut.userProfile || {})
			const enriched: Record<string, unknown> = {...(payloadOut.userProfile || {})}

			// Email from user.email
			if (!enriched.email && data.email) {
				enriched.email = data.email
			}

			// Website from profile.website
			if (!enriched.website && primary?.website) {
				enriched.website = primary.website
			}

			// Profile text from profile.bio
			if (!enriched.profile_text && primary?.bio) {
				enriched.profile_text = primary.bio
			}

			// Name splitting from displayName or user.name
			const hasFirst = typeof enriched.first_name === 'string' && enriched.first_name.trim().length > 0
			const hasLast = typeof enriched.last_name === 'string' && enriched.last_name.trim().length > 0
			if (!hasFirst && !hasLast) {
				const sourceName = (primary?.displayName || data.name || '').trim()
				if (sourceName) {
					const parts = sourceName.split(/\s+/)
					if (parts.length >= 1) {
						enriched.first_name = parts[0]
						const rest = parts.slice(1).join(' ').trim()
						if (rest) enriched.last_name = rest
					}
				}
			}

			// Country simple inference from location
			if (!enriched.country && primary?.location) {
				const loc = primary.location.toLowerCase()
				if (/\b(usa|united states|new york|ny|ca|california|tx|texas)\b/i.test(primary.location)) enriched.country = 'USA'
				else if (/\b(india|mumbai|delhi|bangalore|bengaluru|pune)\b/i.test(primary.location)) enriched.country = 'IND'
			}

			const after = JSON.stringify(enriched)
			if (before !== after) {
				/*
				 * Assign only if something changed
				 * Cast is safe because keys align with UserInfoMutationSchema.partial
				 */
				payloadOut.userProfile = enriched as any
			}
		} catch {}

		return payloadOut
	} catch (error: any) {
		throw error
	}
}


