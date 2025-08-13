import {Project, ProjectMutation} from '@/lib/project/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {addProjectToDB, deleteProjectFromDB, updateProjectInDB} from '@/lib/project/actions'

export const useAddProjectMutation = (options?: MutationOptions<Project, Error, {data: ProjectMutation, resumeId?: string}>) => useMutation({
    mutationFn: ({data, resumeId}) => addProjectToDB(data, resumeId || 'base'),
	...options
})

export const useUpdateProjectMutation = (options?: MutationOptions<Project, Error, {id: string, data: Partial<ProjectMutation>, resumeId?: string}>) => useMutation({
    mutationFn: ({id, data, resumeId}) => updateProjectInDB(id, data, resumeId || 'base'),
	...options
})

export const useDeleteProjectMutation = (options?: MutationOptions<void, Error, {id: string, resumeId?: string}>) => useMutation({
    mutationFn: ({id, resumeId}) => deleteProjectFromDB(id, resumeId || 'base'),
	...options
})
