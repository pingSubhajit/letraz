import {queryOptions, useQuery} from '@tanstack/react-query'
import {BASE_RESUME_KEYS, RESUMES_KEYS} from '@/lib/resume/key'
import {getResumeFromDB, listResumesForUser} from '@/lib/resume/actions'
import {ResumeListItem} from '@/lib/resume/types'

export const baseResumeQueryOptions = queryOptions({
	queryKey: BASE_RESUME_KEYS,
	queryFn: () => getResumeFromDB('base')
})


export const useBaseResume = () => useQuery(baseResumeQueryOptions)

export const resumesListQueryOptions = queryOptions<ResumeListItem[]>({
	queryKey: RESUMES_KEYS,
	queryFn: () => listResumesForUser()
})

export const useResumes = () => useQuery(resumesListQueryOptions)
