import {Experience, ExperienceMutation} from '@/lib/experience/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {addExperienceToDB, deleteExperienceFromDB, updateExperienceInDB} from '@/lib/experience/actions'

export const useAddUserExperienceMutation = (options?: MutationOptions<Experience, Error, {data: ExperienceMutation, resumeId?: string}>) => useMutation({
	// eslint-disable-next-line no-console
	mutationFn: ({data, resumeId}) => {console.log('[experience][add]', {resumeId: resumeId || 'base', data}); return addExperienceToDB(data, resumeId || 'base')},
	...options
})

export const useUpdateExperienceMutation = (options?: MutationOptions<Experience, Error, {id: string, data: Partial<ExperienceMutation>, resumeId?: string}>) => useMutation({
	// eslint-disable-next-line no-console
	mutationFn: ({id, data, resumeId}) => {console.log('[experience][update]', {id, resumeId: resumeId || 'base', data}); return updateExperienceInDB(id, data, resumeId || 'base')},
	...options
})

export const useDeleteExperienceMutation = (options?:MutationOptions<void, Error, {id: string, resumeId?: string}>) => useMutation({
	// eslint-disable-next-line no-console
	mutationFn: ({id, resumeId}) => {console.log('[experience][delete]', {id, resumeId: resumeId || 'base'}); return deleteExperienceFromDB(id, resumeId || 'base')},
	...options
})
