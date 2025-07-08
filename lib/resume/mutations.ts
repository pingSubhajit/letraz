import {useMutation, useQueryClient} from '@tanstack/react-query'
import {rearrangeResumeSections} from '@/lib/resume/actions'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {toast} from 'sonner'

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
