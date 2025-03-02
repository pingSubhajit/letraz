import {queryOptions, useQuery} from '@tanstack/react-query'
import {EDUCATION_KEYS} from '@/lib/education/keys'
import {getEducationsFromDB} from '@/lib/education/actions'

export const educationOptions = queryOptions({
	queryKey: EDUCATION_KEYS,
	queryFn: () => getEducationsFromDB('base')
})


export const useCurrentEducations = () => useQuery(educationOptions)
