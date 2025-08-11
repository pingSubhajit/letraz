import {useMutation, useQueryClient} from '@tanstack/react-query'
import {parseUploadedResume, rearrangeResumeSections} from '@/lib/resume/actions'
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

type ParseResumeParams = {
  formData: FormData
  format?: 'proprietary' | 'generic'
}

export const useParseResumeMutation = () => {
	return useMutation<any, Error, ParseResumeParams>({
		mutationFn: async ({formData, format = 'proprietary'}) => parseUploadedResume(formData, format)
	})
}
