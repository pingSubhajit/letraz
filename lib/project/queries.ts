import {queryOptions, useQuery} from '@tanstack/react-query'
import {getGlobalSkills, getProjectsFromDB} from './actions'
import {PROJECT_KEYS} from './keys'

export const projectQueryOptions = queryOptions({
	queryKey: PROJECT_KEYS,
	queryFn: () => getProjectsFromDB('base')
})

export const globalSkillsQueryOptions = queryOptions({
	queryKey: [...PROJECT_KEYS, 'globalSkills'],
	queryFn: getGlobalSkills
})

export const useCurrentProjects = () => useQuery(projectQueryOptions)

export const useGlobalSkills = () => useQuery(globalSkillsQueryOptions)
