import {createGateway, generateObject} from 'ai'
import {z} from 'zod'
import log from 'encore.dev/log'
import {secret} from 'encore.dev/config'

const claudeApiKey = secret('ClaudeApiKey')
const aiGatewayKey = secret('AiGatewayKey')
const gateway = createGateway({
	apiKey: aiGatewayKey()
})

// Zod schema for job extraction - unified schema for both Firecrawl markdown and BrightData HTML
const JobExtractionSchema = z.object({
	is_job_posting: z.boolean(),
	confidence: z.number().min(0).max(1).optional(),
	title: z.string().default(''),
	company_name: z.string().default(''),
	location: z.string().optional(),
	salary: z.object({
		currency: z.string().optional(),
		max: z.number().optional(),
		min: z.number().optional()
	}).optional().nullable(),
	requirements: z.array(z.string()).optional().nullable(),
	description: z.string().optional(),
	responsibilities: z.array(z.string()).optional().nullable(),
	benefits: z.array(z.string()).optional().nullable(),
	reason: z.string().optional()
})

export type LLMJobExtractionResult = z.infer<typeof JobExtractionSchema>

export interface JobExtractionResult {
	title: string
	company_name: string
	location?: string
	currency?: string
	salary_min?: number
	salary_max?: number
	requirements?: string[]
	description?: string
	responsibilities?: string[]
	benefits?: string[]
}

/**
 * Unified LLM-based job parser using Claude
 * Works with both Firecrawl markdown and BrightData HTML content
 */
export class LLMJobParser {
	constructor() {
		const apiKey = claudeApiKey()
		log.info('LLMJobParser initialization', {
			hasClaudeApiKey: !!apiKey,
			claudeApiKeyLength: apiKey?.length || 0
		})

		// Verify API key is available
		if (!apiKey) {
			throw new Error('Claude API key is required for LLM job parsing')
		}
	}

	/**
	 * Parse job data from any text content (markdown, HTML, etc.) using Claude
	 */
	async parseJobContent(content: string, url: string, contentType: 'markdown' | 'html' = 'markdown'): Promise<JobExtractionResult> {
		try {
			log.info('Starting LLM job parsing', {
				url,
				contentLength: content.length,
				contentType,
				provider: 'claude'
			})

			// Clean and truncate content if too long
			const cleanedContent = this.cleanContent(content)
			const maxContentLength = 100000 // Roughly 30k tokens * 3 chars per token
			const truncatedContent = cleanedContent.length > maxContentLength
				? cleanedContent.substring(0, maxContentLength) + '...'
				: cleanedContent

			log.info('Content prepared for LLM', {
				originalLength: content.length,
				cleanedLength: cleanedContent.length,
				finalLength: truncatedContent.length,
				truncated: cleanedContent.length > maxContentLength
			})

			// Create the structured prompt
			const prompt = this.createJobExtractionPrompt(truncatedContent, url, contentType)

			// Call Claude using Vercel AI SDK with structured output
			let result
			try {
				result = await generateObject({
					model: gateway('anthropic/claude-haiku-4.5'),
					schema: JobExtractionSchema,
					prompt,
					temperature: 0.1 // Low temperature for consistent extraction
				})
			} catch (schemaError) {
				log.error(schemaError as Error, 'Schema validation failed - Claude response did not match expected schema', {
					url,
					contentType,
					errorMessage: schemaError instanceof Error ? schemaError.message : 'Unknown error'
				})
				throw schemaError
			}

			const extractedData = result.object

			log.info('LLM parsing completed', {
				isJobPosting: extractedData.is_job_posting,
				confidence: extractedData.confidence,
				title: extractedData.title,
				companyName: extractedData.company_name,
				hasRequirements: !!extractedData.requirements?.length,
				hasResponsibilities: !!extractedData.responsibilities?.length,
				hasBenefits: !!extractedData.benefits?.length
			})

			// Check if it's actually a job posting
			if (!extractedData.is_job_posting) {
				throw new Error(`Content is not a job posting: ${extractedData.reason || 'No reason provided'}`)
			}

			// Check confidence level
			if (extractedData.confidence && extractedData.confidence < 0.7) {
				log.warn('Low confidence job extraction', {
					confidence: extractedData.confidence,
					url
				})
			}

			// Convert to our internal format
			return this.convertToJobExtractionResult(extractedData)

		} catch (error) {
			log.error(error as Error, 'LLM job parsing failed', {url, contentType})
			throw new Error(`LLM job parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	/**
	 * Clean content for LLM processing
	 */
	private cleanContent(content: string): string {
		// Remove excessive whitespace and normalize
		let cleaned = content
			.replace(/\s+/g, ' ') // Replace multiple whitespace with single space
			.replace(/\n\s*\n/g, '\n') // Remove empty lines
			.trim()

		// Remove common noise patterns
		cleaned = cleaned
			.replace(/\[.*?\]/g, '') // Remove markdown links
			.replace(/\*{2,}/g, '') // Remove excessive asterisks
			.replace(/#{2,}/g, '#') // Normalize headers

		return cleaned
	}

	/**
	 * Create the job extraction prompt
	 */
	private createJobExtractionPrompt(content: string, url: string, contentType: string): string {
		const contentDescription = contentType === 'markdown'
			? 'The content below is in Markdown format from a job posting webpage.'
			: 'The content below is HTML content from a job posting webpage.'

		return `You are a job posting analyzer. Analyze the provided content to determine if it contains a job posting, and if so, extract structured job information.

${contentDescription} Please first determine if this is actually a job posting, then extract information accordingly.

IMPORTANT CLASSIFICATION RULES:
1. A job posting should contain:
   - A specific job title/position
   - Job responsibilities or description
   - Company information
   - Usually requirements or qualifications

2. NOT job postings include:
   - Company homepages or about pages
   - News articles or blog posts
   - Product pages or marketing content
   - Search results or listing pages
   - Error pages or redirects
   - General career pages without specific positions

EXTRACTION RULES:
- If is_job_posting is false, fill title, company_name, and other job fields with empty strings/arrays
- If is_job_posting is true, extract all available information
- For salary: extract any monetary values mentioned (annual, hourly, etc.)
- Keep descriptions concise but informative (2-3 sentences max)
- Set confidence to at least 0.7 for clear job postings, lower for ambiguous content
- The job_url should be: ${url}

CONTENT TO ANALYZE:
${content}`
	}

	/**
	 * Convert LLM response to our internal JobExtractionResult format
	 */
	private convertToJobExtractionResult(data: LLMJobExtractionResult): JobExtractionResult {
		return {
			title: data.title || '<TITLE_NOT_FOUND>',
			company_name: data.company_name || '<COMPANY_NOT_FOUND>',
			location: data.location || undefined,
			currency: data.salary?.currency || undefined,
			salary_min: data.salary?.min || undefined,
			salary_max: data.salary?.max || undefined,
			requirements: data.requirements || undefined,
			description: data.description || undefined,
			responsibilities: data.responsibilities || undefined,
			benefits: data.benefits || undefined
		}
	}
}
