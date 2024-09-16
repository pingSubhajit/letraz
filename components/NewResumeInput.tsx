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
import {AnimatePresence, motion} from 'framer-motion'

const formSchema = z.object({
	input: z.string(),
})

const NewResumeInput = ({className}: {className?: string}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			input: '',
		},
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
		form.reset()
	}
	
	const [inputFocused, setInputFocused] = useState(false)

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={cn('overflow-hidden bg-white p-4 pt-6 flex ' +
				'flex-col justify-between gap-4 relative z-[60] hover:shadow-2xl focus-within:shadow-2xl ' +
				'shadow-orange-300 transition', className)}>
				<FormField
					control={form.control}
					name="input"
					render={({ field }) => (
						<FormItem className="h-full flex flex-col gap-4">
							<FormLabel className="text-orange-600 uppercase tracking-widest text-xs font-semibold">Craft new resume for a job</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Paste URL or job description" {...field}
									className="h-full p-0 border-none resize-none"
									onFocus={() => setInputFocused(true)}
									onBlur={() => setInputFocused(false)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Submit</Button>

				{createPortal(
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
		className="fixed inset-0 z-50 bg-white/70"
	/>}
</AnimatePresence>