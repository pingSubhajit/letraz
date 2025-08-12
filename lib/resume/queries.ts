import {queryOptions, useQuery} from '@tanstack/react-query'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {getResumeFromDB} from '@/lib/resume/actions'
import type {Resume} from '@/lib/resume/types'

export const baseResumeQueryOptions = queryOptions({
	queryKey: BASE_RESUME_KEYS,
	queryFn: () => getResumeFromDB('base')
})


export const useBaseResume = () => useQuery(baseResumeQueryOptions)

export const resumeByIdQueryOptions = (resumeId: string) => queryOptions<Resume>({
	queryKey: ['resume', resumeId],
	queryFn: () => getResumeFromDB(resumeId),
	// Avoid refetch pause on error; keep polling to reduce flicker and recover automatically
	retry: 3,
	refetchInterval: (query) => {
        const data = query.state.data as Resume | undefined
		if (!data) return 2000
		const normalizedStatus = (data.status || '').toString().toLowerCase()
		const doneStatuses = new Set(['success', 'failed', 'completed'])
		const hasSections = Array.isArray(data.sections) && data.sections.length > 0
		if (hasSections || doneStatuses.has(normalizedStatus)) return false
		return 2000
	}
})

export const useResumeById = (resumeId: string) => useQuery(resumeByIdQueryOptions(resumeId))
