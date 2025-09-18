'use server'

import {z} from 'zod'
import {BrightDataLinkedInProfile, BrightDataLinkedInProfileSchema} from '@/lib/linkedin/types'

const BRIGHTDATA_ENDPOINT = 'https://api.brightdata.com/datasets/v3/scrape'

const LinkedInUrlSchema = z
	.string()
	.url()
	.refine((u) => /linkedin\.com\/in\//.test(u), {
		message: 'Must be a valid LinkedIn profile URL containing /in/'
	})

type BrightDataRequestPayload = {
	input: Array<{ url: string }>
}

type BrightDataResponse = Record<string, unknown>

export const parseLinkedInProfile = async (profileUrl: string): Promise<BrightDataLinkedInProfile> => {
	const parsedUrl = LinkedInUrlSchema.parse(profileUrl.trim())
	const token = process.env.BRIGHTDATA_TOKEN
	const datasetId = process.env.BRIGHTDATA_DATASET_ID

	if (!token) {
		throw new Error('Missing BRIGHTDATA_TOKEN environment variable')
	}
	if (!datasetId) {
		throw new Error('Missing BRIGHTDATA_DATASET_ID environment variable')
	}

	const body: BrightDataRequestPayload = {
		input: [{url: parsedUrl}]
	}

	const requestUrl = `${BRIGHTDATA_ENDPOINT}?dataset_id=${encodeURIComponent(datasetId)}&notify=false&include_errors=true`

	let response: Response
	try {
		response = await fetch(requestUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(body),
			cache: 'no-store'
		})
	} catch (networkError) {
		throw new Error('Failed to reach BrightData API')
	}

	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`BrightData API error: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`)
	}

	// BrightData returns an array with one object for our single input
	const result = (await response.json()) as BrightDataResponse

	// Validate shape
	return BrightDataLinkedInProfileSchema.parse(result)
}


