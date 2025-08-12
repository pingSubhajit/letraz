import {Experience, ExperienceMutation} from '@/lib/experience/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {deleteExperienceFromDB, addExperienceToDB, updateExperienceInDB} from '@/lib/experience/actions'

export const useAddUserExperienceMutation = (options?: MutationOptions<Experience, Error, {data: ExperienceMutation, resumeId?: string}>) => useMutation({
    mutationFn: ({data, resumeId}) => addExperienceToDB(data, resumeId || 'base'),
	...options
})

export const useUpdateExperienceMutation = (options?: MutationOptions<Experience, Error, {id: string, data: Partial<ExperienceMutation>}>) => useMutation({
	mutationFn: ({id, data}) => updateExperienceInDB(id, data),
	...options
})

export const useDeleteExperienceMutation = (options?:MutationOptions<void, Error, {id: string, resumeId?: string}>) => useMutation({
    mutationFn: ({id, resumeId}) => deleteExperienceFromDB(id, resumeId || 'base'),
	...options
})
