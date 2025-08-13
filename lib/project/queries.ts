import {queryOptions, useQuery} from '@tanstack/react-query'
import {getGlobalSkills, getProjectsFromDB} from './actions'
import {PROJECT_KEYS} from './keys'

export const projectQueryOptions = (resumeId: string) => queryOptions({
	queryKey: [...PROJECT_KEYS, resumeId],
	queryFn: () => getProjectsFromDB(resumeId)
})

export const globalSkillsQueryOptions = queryOptions({
	queryKey: [...PROJECT_KEYS, 'globalSkills'],
	queryFn: getGlobalSkills
})

export const useCurrentProjects = (resumeId: string) => {
    return useQuery(projectQueryOptions(resumeId))
}

export const useGlobalSkills = () => useQuery(globalSkillsQueryOptions)
