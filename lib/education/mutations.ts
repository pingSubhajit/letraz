import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Education, EducationMutation} from '@/lib/education/types'
import {deleteEducationFromDB, addEducationToDB, updateEducationInDB} from '@/lib/education/actions'

export const useAddEducationMutation = (options?: MutationOptions<Education|undefined, Error, {data: EducationMutation, resumeId?: string}>) => useMutation({
	mutationFn: ({data, resumeId}) => addEducationToDB(data, resumeId || 'base'),
	...options
})

export const useUpdateEducationMutation = (options?: MutationOptions<Education|undefined, Error, {id: string, data: Partial<EducationMutation>}>) => useMutation({
	mutationFn: ({id, data}) => updateEducationInDB(id, data),
	...options
})

export const useDeleteEducationMutation = (options?:MutationOptions<void, Error, {id: string, resumeId?: string}>) => useMutation({
	mutationFn: ({id, resumeId}) => deleteEducationFromDB(id, resumeId || 'base'),
	...options
})
