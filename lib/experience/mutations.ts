import {Experience, ExperienceMutation} from '@/lib/experience/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {deleteExperienceFromDB, updateExperienceOnDB} from './actions'

export const useUpdateUserExperienceMutation = (options?: MutationOptions<Experience, Error, ExperienceMutation>) => useMutation(
	{
		mutationFn: updateExperienceOnDB,
		...options
	}
)

export const useDeleteExperienceMutation = (options?:MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (experienceId) => deleteExperienceFromDB(experienceId, 'base'),
	...options
})
