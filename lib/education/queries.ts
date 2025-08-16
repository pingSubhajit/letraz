import {queryOptions, useQuery} from '@tanstack/react-query'
import {EDUCATION_KEYS} from '@/lib/education/keys'
import {getEducationsFromDB} from '@/lib/education/actions'

export const educationOptions = (resumeId: string = 'base') => queryOptions({
	queryKey: [...EDUCATION_KEYS, resumeId],
	queryFn: () => getEducationsFromDB(resumeId)
})


export const useCurrentEducations = (resumeId: string = 'base') => {
	return useQuery(educationOptions(resumeId))
}
