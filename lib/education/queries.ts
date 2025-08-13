import {queryOptions, useQuery} from '@tanstack/react-query'
import {EDUCATION_KEYS} from '@/lib/education/keys'
import {getEducationsFromDB} from '@/lib/education/actions'

export const educationOptions = (resumeId: string) => queryOptions({
	queryKey: [...EDUCATION_KEYS, resumeId],
	queryFn: () => getEducationsFromDB(resumeId)
})


export const useCurrentEducations = (resumeId: string) => {
    return useQuery(educationOptions(resumeId))
}
