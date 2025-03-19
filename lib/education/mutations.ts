import {MutationOptions, useMutation} from '@tanstack/react-query'
import {Education, EducationMutation} from '@/lib/education/types'
import {deleteEducationFromDB, addEducationToDB, updateEducationInDB} from '@/lib/education/actions'

export const useAddEducationMutation = (options?: MutationOptions<Education|undefined, Error, EducationMutation>) => useMutation({
	mutationFn: addEducationToDB,
	...options
})

export const useUpdateEducationMutation = (options?: MutationOptions<Education|undefined, Error, {id: string, data: Partial<EducationMutation>}>) => useMutation({
	mutationFn: ({id, data}) => updateEducationInDB(id, data),
	...options
})

export const useDeleteEducationMutation = (options?:MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (id) => deleteEducationFromDB(id, 'base'),
	...options
})
