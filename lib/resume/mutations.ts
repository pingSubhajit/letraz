import {MutationOptions, useMutation, useQueryClient} from '@tanstack/react-query'
import {rearrangeResumeSections, tailorResumeInDB} from '@/lib/resume/actions'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {toast} from 'sonner'
import type {TailorResumeResponse} from '@/lib/resume/types'

export const useRearrangeResumeSectionsMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({resumeId, sectionIds}: {resumeId: string, sectionIds: string[]}) => rearrangeResumeSections(resumeId, sectionIds),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: BASE_RESUME_KEYS})
		},
		onError: (error) => {
			toast.error('Failed to update section order')
		}
	})
}

export const useTailorResumeMutation = (
	options?: MutationOptions<TailorResumeResponse|undefined, Error, { target: string }>
) => useMutation({
	mutationFn: (payload) => tailorResumeInDB(payload),
	...options
})
