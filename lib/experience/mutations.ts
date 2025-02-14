import {Experience, ExperienceMutation} from '@/lib/experience/types'
import {MutationOptions, useMutation} from '@tanstack/react-query'
import {deleteExperienceFromDB, addExperienceToDB} from '@/lib/experience/actions'

export const useAddUserExperienceMutation = (options?: MutationOptions<Experience, Error, ExperienceMutation>) => useMutation(
	{
		mutationFn: addExperienceToDB,
		...options
	}
)

export const useDeleteExperienceMutation = (options?:MutationOptions<void, Error, string>) => useMutation({
	mutationFn: (experienceId) => deleteExperienceFromDB(experienceId, 'base'),
	...options
})
