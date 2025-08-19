import {MutationOptions, useMutation, useQueryClient} from '@tanstack/react-query'
import {
	deleteResumeFromDB,
	exportResumeFromDB,
	parseUploadedResume,
	rearrangeResumeSections,
	replaceResume,
	tailorResumeInDB
} from '@/lib/resume/actions'
import {EnhancedResumeMutation} from '@/lib/resume/parser'
import {BASE_RESUME_KEYS} from '@/lib/resume/key'
import {toast} from 'sonner'
import type {TailorResumeResponse} from '@/lib/resume/types'
import {ExportResumeResponse, Resume, ResumeMutation} from '@/lib/resume/types'

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

type ParseResumeParams = {
  formData: FormData
  format?: 'proprietary' | 'generic'
}

export const useParseResumeMutation = () => {
	return useMutation<EnhancedResumeMutation, Error, ParseResumeParams>({
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

export const useExportResumeMutation = () => {
	return useMutation<ExportResumeResponse, Error, string>({
		mutationFn: async (resumeId: string) => exportResumeFromDB(resumeId),
		onError: () => {
			toast.error('Failed to export resume. Please try again.')
		}
	})
}

export const useDeleteResumeMutation = () => {
	const queryClient = useQueryClient()
	return useMutation<void, Error, string>({
		mutationFn: async (resumeId: string) => deleteResumeFromDB(resumeId),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: BASE_RESUME_KEYS})
			toast.success('Resume deleted successfully')
		},
		onError: () => {
			toast.error('Failed to delete resume. Please try again.')
		}
	})
}
