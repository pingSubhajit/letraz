/**
 * URL detection and validation utilities for job extraction
 * Based on the Go implementation patterns from letraz-utils
 */

export enum LinkedInURLType {
	UNKNOWN = 'unknown',
	JOB_VIEW = 'job_view',
	JOB_COLLECTION = 'job_collection',
	NON_JOB = 'non_job'
}

export interface LinkedInURLInfo {
	type: LinkedInURLType;
	jobId?: string;
	publicUrl?: string;
}

/**
 * Checks if a URL is a LinkedIn URL
 */
export const isLinkedInURL = (urlStr: string): boolean => {
	if (!urlStr) return false

	try {
		const url = new URL(urlStr)
		const hostname = url.hostname.toLowerCase()
		return hostname === 'linkedin.com' || hostname === 'www.linkedin.com'
	} catch {
		return false
	}
}

/**
 * Parses a LinkedIn URL to determine its type and extract job information
 */
export const parseLinkedInURL = (urlStr: string): LinkedInURLInfo => {
	if (!isLinkedInURL(urlStr)) {
		throw new Error(`Not a LinkedIn URL: ${urlStr}`)
	}

	const url = new URL(urlStr)
	const path = url.pathname.toLowerCase()
	const searchParams = url.searchParams

	// Check for direct job view URLs: /jobs/view/123456
	const jobViewMatch = path.match(/^\/jobs\/view\/(\d+)\/?$/)
	if (jobViewMatch) {
		const jobId = jobViewMatch[1]
		return {
			type: LinkedInURLType.JOB_VIEW,
			jobId,
			publicUrl: `https://www.linkedin.com/jobs/view/${jobId}`
		}
	}

	// Check for job collection URLs: /jobs/collections/recommended/?currentJobId=123456
	if (path.startsWith('/jobs/collections/')) {
		const currentJobId = searchParams.get('currentJobId')
		if (currentJobId && /^\d+$/.test(currentJobId)) {
			return {
				type: LinkedInURLType.JOB_COLLECTION,
				jobId: currentJobId,
				publicUrl: `https://www.linkedin.com/jobs/view/${currentJobId}`
			}
		}
		// Collection URL without valid job ID is non-job
		return {type: LinkedInURLType.NON_JOB}
	}

	// Check for other job-related paths
	const jobPaths = ['/jobs/view/', '/jobs/search/']
	for (const jobPath of jobPaths) {
		if (path.startsWith(jobPath)) {
			// Conservative approach - treat as non-job unless it matches our specific patterns
			return {type: LinkedInURLType.NON_JOB}
		}
	}

	// All other LinkedIn URLs are non-job (profiles, company pages, feed, etc.)
	return {type: LinkedInURLType.NON_JOB}
}

/**
 * Checks if a LinkedIn URL is specifically a job posting URL
 */
export const isLinkedInJobURL = (urlStr: string): boolean => {
	if (!isLinkedInURL(urlStr)) return false

	try {
		const info = parseLinkedInURL(urlStr)
		return info.type === LinkedInURLType.JOB_VIEW || info.type === LinkedInURLType.JOB_COLLECTION
	} catch {
		return false
	}
}

/**
 * Converts various LinkedIn job URL formats to the public job view format
 */
export const convertToPublicLinkedInJobURL = (urlStr: string): string => {
	const info = parseLinkedInURL(urlStr)

	switch (info.type) {
		case LinkedInURLType.JOB_VIEW:
		case LinkedInURLType.JOB_COLLECTION:
			if (!info.publicUrl) {
				throw new Error(`Unable to generate public URL for: ${urlStr}`)
			}
			return info.publicUrl
		case LinkedInURLType.NON_JOB:
			throw new Error(`LinkedIn URL is not a job posting: ${urlStr}`)
		default:
			throw new Error(`Unknown LinkedIn URL type for: ${urlStr}`)
	}
}

/**
 * Extracts the job ID from a LinkedIn job URL
 */
export const extractLinkedInJobID = (urlStr: string): string => {
	const info = parseLinkedInURL(urlStr)

	if (!info.jobId) {
		throw new Error(`No job ID found in LinkedIn URL: ${urlStr}`)
	}

	return info.jobId
}
