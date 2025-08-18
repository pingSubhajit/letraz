import {Experience, ExperienceMutation} from '@/lib/experience/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {addExperienceToDB, deleteExperienceFromDB, updateExperienceInDB} from '@/lib/experience/actions'

export const useAddUserExperienceMutation = (options?: MutationOptions<Experience, Error, {data: ExperienceMutation, resumeId?: string}>) => useMutation({
	mutationFn: ({data, resumeId}) => {
		return addExperienceToDB(data, resumeId || 'base')
	},
	...options
})

export const useUpdateExperienceMutation = (options?: MutationOptions<Experience, Error, {id: string, data: Partial<ExperienceMutation>, resumeId?: string}>) => useMutation({
	mutationFn: ({id, data, resumeId}) => {
		return updateExperienceInDB(id, data, resumeId || 'base')
	},
	...options
})

export const useDeleteExperienceMutation = (options?:MutationOptions<void, Error, {id: string, resumeId?: string}>) => useMutation({
	mutationFn: ({id, resumeId}) => {
		return deleteExperienceFromDB(id, resumeId || 'base')
	},
	...options
})
