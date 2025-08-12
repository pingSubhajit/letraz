import {useMutation, useQueryClient} from '@tanstack/react-query'
import {parseUploadedResume, rearrangeResumeSections, replaceResume} from '@/lib/resume/actions'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {toast} from 'sonner'
import {Resume, ResumeMutation} from '@/lib/resume/types'

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

type ReplaceResumeParams = {
  payload: ResumeMutation
  resumeId?: string | 'base'
}

export const useReplaceResumeMutation = () => {
	const queryClient = useQueryClient()
	return useMutation<Resume, Error, ReplaceResumeParams>({
		mutationFn: async ({payload, resumeId = 'base'}) => replaceResume(payload, resumeId),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: BASE_RESUME_KEYS})
		},
		onError: () => {
			toast.error('Failed to replace resume')
		}
	})
}
