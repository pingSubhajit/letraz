import {Project, ProjectMutation} from '@/lib/project/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {addProjectToDB, deleteProjectFromDB, updateProjectInDB} from '@/lib/project/actions'

export const useAddProjectMutation = (options?: MutationOptions<Project, Error, ProjectMutation>) => useMutation({
	mutationFn: addProjectToDB,
	...options
})

export const useUpdateProjectMutation = (options?: MutationOptions<Project, Error, {id: string, data: Partial<ProjectMutation>}>) => useMutation({
	mutationFn: ({id, data}) => updateProjectInDB(id, data),
	...options
})

export const useDeleteProjectMutation = (options?: MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (projectId) => deleteProjectFromDB(projectId),
	...options
})
