'use client'

import {useSidebar} from '@/components/providers/SidebarProvider'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {ChevronLeft, Send} from 'lucide-react'
import {useState} from 'react'
import {motion} from 'motion/react'
import DEFAULT_FADE_ANIMATION from '@/components/animations/DefaultFade'
import {toast} from 'sonner'
import {useForm} from 'react-hook-form'

type FeedbackFormData = {
	subject?: string
	message: string
}

interface UserSupportPanelProps {
	/** Hide header (for mobile bottom sheet which has its own header) */
	hideHeader?: boolean
}

const UserSupportPanel = ({hideHeader = false}: UserSupportPanelProps = {}) => {
	const {collapseSidebar} = useSidebar()
	const [isSubmitted, setIsSubmitted] = useState(false)

	const {
		register,
		handleSubmit,
		formState: {errors, isSubmitting, isValid},
		reset
	} = useForm<FeedbackFormData>({
		defaultValues: {
			subject: '',
			message: ''
		}
	})

	const onSubmit = async (data: FeedbackFormData) => {
		try {
			/*
			 * TODO: Implement API call to submit feedback
			 * await fetch('/api/feedback', {
			 *   method: 'POST',
			 *   headers: { 'Content-Type': 'application/json' },
			 *   body: JSON.stringify(data)
			 * })
			 */

			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000))

			setIsSubmitted(true)
			reset()

			// Reset success message after 3 seconds
			setTimeout(() => {
				setIsSubmitted(false)
			}, 3000)
		} catch (error) {
			toast.error('Could not send feedback. Try again?')
		}
	}

	return (
		<div className="h-full w-full flex flex-col bg-background [&>*]:font-jakarta">
			{/* Header - Desktop only (mobile uses MobilePanelSheet header) */}
			{!hideHeader && (
				<div className="flex items-center justify-between py-4 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={collapseSidebar}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<div className="flex items-center gap-2">
							<h3 className="font-semibold text-lg">Help and support</h3>
						</div>
					</div>
				</div>
			)}

			{/* Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-2xl mx-auto p-6">
					{/* Welcome Message */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-2">We'd love to hear from you</h2>
						<p className="text-muted-foreground text-sm opacity-80">
							Share your feedback, report bugs, request features, or ask questions.
							We're here to help make your beta experience better.
						</p>
					</div>

					{/* Feedback Form */}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="subject" className="text-xs">Subject (optional)</Label>
							<Input
								id="subject"
								placeholder="Brief summary of your feedback"
								disabled={isSubmitting}
								className="w-full"
								{...register('subject')}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="message" className="text-xs">
								Message
							</Label>
							<Textarea
								id="message"
								placeholder="Tell us what's on your mind... Whether it's a bug, feature idea, question, or general feedback, we're all ears!"
								disabled={isSubmitting}
								className="w-full resize-none min-h-[300px] lg:min-h-[400px]"
								{...register('message', {
									required: 'Please enter your message',
									validate: (value) => value.trim().length > 0 || 'Message cannot be empty'
								})}
							/>
							{errors.message && (
								<p className="text-xs text-destructive">{errors.message.message}</p>
							)}
							<p className="text-xs text-muted-foreground">
								Be as detailed as you'd like. Screenshots and specific examples are always helpful!
							</p>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={!isValid || isSubmitting}
								className="w-full"
							>
								{isSubmitting ? (
									<>
										<span className="animate-pulse">Sending...</span>
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Send feedback
									</>
								)}
							</Button>
						</div>
					</form>

					{/* Success Message */}
					{isSubmitted && (
						<motion.div
							className="mt-2 text-sm text-center w-full"
							{...DEFAULT_FADE_ANIMATION}
						>
							<p>Thanks! We will reach out to you on email shortly</p>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	)
}

export default UserSupportPanel

