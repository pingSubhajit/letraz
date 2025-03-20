import {queryOptions, useQuery} from '@tanstack/react-query'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {getResumeFromDB} from '@/lib/resume/actions'

export const baseResumeQueryOptions = queryOptions({
	queryKey: BASE_RESUME_KEYS,
	queryFn: () => getResumeFromDB('base')
})


export const useBaseResume = () => useQuery(baseResumeQueryOptions)
