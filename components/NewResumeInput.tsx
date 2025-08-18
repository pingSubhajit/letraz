'use client'

import {z} from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {Textarea} from '@/components/ui/textarea'
import {createPortal} from 'react-dom'
import {useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {useTransitionRouter} from 'next-view-transitions'
import {Loader2} from 'lucide-react'
import {toast} from 'sonner'
import useDOMMounted from '@/hooks/useDOMMounted'

const formSchema = z.object({
	input: z.string().min(1, 'Please enter a valid URL or job description').transform(input => encodeURIComponent(input))
})

const NewResumeInput = ({className}: {className?: string}) => {
	const mounted = useDOMMounted()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			input: ''
		}
	})

	const router = useTransitionRouter()

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const jobDetails = '' // implement resume tailoring flow
		} catch (error: any) {
			toast.error(error.message || 'Could not understand the job')
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
							{!form.formState.isSubmitted && <FormControl>
								<Textarea
									placeholder="Paste URL or job description" {...field}
									className="h-full p-0 border-none resize-none"
									onFocus={() => setInputFocused(true)}
									onBlur={() => setInputFocused(false)}
								/>
							</FormControl>}
							<FormMessage />
						</FormItem>
					)}
				/>
				{form.formState.isValid && <Button type="submit" disabled={!form.formState.isValid}>
					{(form.formState.isSubmitting || form.formState.isSubmitted) && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
					Submit
				</Button>}

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
