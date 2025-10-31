'use server'

import {z} from 'zod'
import {parseLinkedInProfile as parseLinkedInProfileViaScraper} from '@/lib/linkedin/parser'
import {type BrightDataLinkedInProfile} from '@/lib/linkedin/types'

const InputSchema = z.object({
	url: z
		.string()
		.url('Invalid URL')
		.refine((u) => /linkedin\.com\/in\//.test(u), 'Must be a LinkedIn profile URL (contains /in/)')
})

export type ParseLinkedInProfileResponse = BrightDataLinkedInProfile

/**
 * Server action to parse a LinkedIn profile via BrightData
 */
export const parseLinkedInProfile = async (payload: unknown): Promise<ParseLinkedInProfileResponse> => {
	const {url} = InputSchema.parse(payload)
	return await parseLinkedInProfileViaScraper(url)
}
