'use client'

import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {Textarea} from '@/components/ui/textarea'
import {createPortal} from 'react-dom'
import {useRef, useState} from 'react'
import {useHotkeys} from '@mantine/hooks'
import {AnimatePresence, motion} from 'motion/react'
import {useTransitionRouter} from 'next-view-transitions'
import {Loader2} from 'lucide-react'
import {toast} from 'sonner'
import useDOMMounted from '@/hooks/useDOMMounted'
import {useTailorResumeMutation} from '@/lib/resume/mutations'
import {bucket, useAnalytics} from '@/lib/analytics'

const urlSchema = z.string().url()

const formSchema = z.object({
	input: z.string()
		.trim()
		.min(10, 'Please enter at least 10 characters')
		.refine(
			(value) => urlSchema.safeParse(value).success || value.length >= 50,
			'Enter a valid job URL or a longer job description (50+ chars)'
		)
})

const NewResumeInput = ({className}: {className?: string}) => {
	const mounted = useDOMMounted()
	const {track} = useAnalytics()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			input: ''
		}
	})

	const router = useTransitionRouter()
	const {mutateAsync: tailorResume, isPending} = useTailorResumeMutation()
	const submittingRef = useRef(false)

	useHotkeys([
		['mod+Enter', () => form.handleSubmit(onSubmit)()]
	])

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			submittingRef.current = true
			const rawInput = values.input
			const payload = {target: rawInput}

			// Track submission intent
			track('tailor_resume_submitted', {
				target_type: urlSchema.safeParse(rawInput).success ? 'url' : 'text',
				input_length_bucket: bucket(rawInput.length),
				has_base_resume: false // updated later if needed
			})

			const response = await tailorResume(payload)

			const resumeId = response?.id
			if (!resumeId) throw new Error('No resume id returned')

			track('tailor_resume_created', {resume_id: resumeId})

			router.replace(`/app/craft/resumes/${resumeId}`)
		} catch (error: any) {
			toast.error(error.message || 'Could not understand the job')
		} finally {
			submittingRef.current = false
		}
	}

	const [inputFocused, setInputFocused] = useState(false)

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn('min-h-96 overflow-hidden bg-white shadow-lg p-4 pt-6 flex ' +
				'flex-col justify-between gap-4 relative z-40 hover:shadow-2xl focus-within:shadow-2xl ' +
				'transition', className)}
			>
				<FormField
					control={form.control}
					name="input"
					render={({field}) => (
						<FormItem className="h-full flex flex-col gap-4">
							<FormLabel className="text-flame-500 uppercase tracking-widest text-xs font-semibold">Craft new resume for a job</FormLabel>
							{(!form.formState.isSubmitted || submittingRef.current) && (
								<FormControl>
									<Textarea
										placeholder="Paste URL or job description"
										{...field}
										className="h-full p-0 border-none resize-none"
										onFocus={() => setInputFocused(true)}
										onBlur={() => setInputFocused(false)}
										onKeyDown={(e) => {
											if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
												e.preventDefault()
												form.handleSubmit(onSubmit)()
											}
										}}
									/>
								</FormControl>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
				{form.formState.isValid && (
					<Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting || isPending}>
						{(form.formState.isSubmitting || form.formState.isSubmitted || isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
						Submit
						<span className="ml-2 hidden sm:inline-flex items-center gap-1 text-[11px] opacity-70">
							<span>⌘</span>
							<span>+</span>
							<span>Enter</span>
						</span>
					</Button>
				)}

				{mounted && createPortal(
					NewResumeInputOverlay({inputFocused}),
					document?.body
				)}
			</form>
		</Form>
	)
}

export default NewResumeInput

const NewResumeInputOverlay = ({inputFocused}: {inputFocused: boolean}) => <AnimatePresence>
	{inputFocused && <motion.div
		initial={{opacity: 0}}
		animate={{opacity: inputFocused ? 1 : 0}}
		exit={{opacity: 0}}
		className="fixed inset-0 z-30 bg-white/70"
	/>}
</AnimatePresence>
