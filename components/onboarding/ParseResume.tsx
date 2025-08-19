'use client'

import {cn} from '@/lib/utils'
import {type ChangeEvent, type DragEvent, JSX, type KeyboardEvent, useEffect, useRef, useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {Button} from '@/components/ui/button'
import {FileCheck} from 'lucide-react'
import DEFAULT_FADE_ANIMATION, {ANIMATE_PRESENCE_MODE} from '@/components/animations/DefaultFade'
import ParticlesBurst from '@/components/animations/ParticlesBurst'
import {useParseResumeMutation, useReplaceResumeMutation} from '@/lib/resume/mutations'
import {useUpdateUserInfoMutation} from '@/lib/user-info/mutations'
import {ACCEPT_ATTRIBUTE, isAcceptedFile} from '@/lib/resume/accept'
import {useRouter} from 'next/navigation'
import {toast} from 'sonner'
import DEFAULT_SLIDE_ANIMATION from '@/components/animations/DefaultSlide'
import StaggeredText from '@/components/animations/StaggeredText'


const PARSING_MESSAGES = [
	'Uploading your resume…',
	'Scanning the document…',
	'Extracting contact details…',
	'Finding education and experiences…',
	'Understanding your skills…',
	'Polishing the results…'
]

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024 // 4 MB

const ParseResume = ({className, toggleParseResume}: { className?: string, toggleParseResume?: () => void }): JSX.Element => {
	const [parsed, setParsed] = useState(false)
	const [particlesSeed] = useState<number>(() => Date.now())
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const {mutateAsync: parseResumeMutation} = useParseResumeMutation()
	const {mutateAsync: replaceResume} = useReplaceResumeMutation()
	const {mutateAsync: updateUserInfo} = useUpdateUserInfoMutation()
	const [isParsing, setIsParsing] = useState(false)
	const router = useRouter()
	const [parsingMessageIndex, setParsingMessageIndex] = useState(0)
	const [showParsingText, setShowParsingText] = useState(false)

	const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
		event.preventDefault()
		event.dataTransfer.dropEffect = 'copy'
	}

	const handleDragEnter = (event: DragEvent<HTMLDivElement>): void => {
		event.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
		event.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
		event.preventDefault()
		setIsDragging(false)

		if (isParsing) return

		const files = Array.from(event.dataTransfer.files)
		const acceptedFiles = files.filter(isAcceptedFile)
		if (acceptedFiles.length > 0 && acceptedFiles[0].size > MAX_FILE_SIZE_BYTES) {
			toast.error('File is too large. Maximum allowed size is 4 MB')
			return
		}

		if (acceptedFiles.length > 0 && !isParsing) {
			void handleFilesUpload(acceptedFiles)
		} else {
			toast.info('No accepted files dropped')
		}
	}

	const handleOpenFileDialog = (): void => {
		if (isParsing) return
		fileInputRef.current?.click()
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if ((event.key === 'Enter' || event.key === ' ') && !isParsing) {
			event.preventDefault()
			handleOpenFileDialog()
		}
	}

	const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
		if (isParsing) return

		const files = Array.from(event.target.files ?? [])
		const acceptedFiles = files.filter(isAcceptedFile)
		if (acceptedFiles.length > 0 && acceptedFiles[0].size > MAX_FILE_SIZE_BYTES) {
			toast.error('File is too large. Maximum allowed size is 4 MB')
			// Reset value to allow selecting the same file again
			event.target.value = ''
			return
		}
		if (acceptedFiles.length > 0 && !isParsing) {
			void handleFilesUpload(acceptedFiles)
		} else if (files.length > 0) {
			toast.warning('Selected files contained unsupported types')
		}
		// Reset value to allow selecting the same file again
		event.target.value = ''
	}

	const handleFilesUpload = async (files: File[]): Promise<void> => {
		try {
			if (files[0] && files[0].size > MAX_FILE_SIZE_BYTES) {
				toast.error('File is too large. Maximum allowed size is 4 MB')
				return
			}
			setIsParsing(true)
			const formData = new FormData()
			// Use the first accepted file for now
			formData.append('file', files[0])
			const enhancedPayload = await parseResumeMutation({formData, format: 'proprietary'})

			// Extract sections and user profile from the enhanced payload
			const sectionsPayload = {sections: enhancedPayload.sections}
			const userProfileData = enhancedPayload.userProfile

			// Update resume sections
			await replaceResume({payload: sectionsPayload, resumeId: 'base'})

			// Update user profile data if any profile information was extracted
			if (userProfileData && Object.keys(userProfileData).length > 0) {
				await updateUserInfo(userProfileData)
			}

			setParsed(true)
		} catch (error) {
			toast.error('Failed to parse resume')
		} finally {
			setIsParsing(false)
		}
	}

	// Particles mode: float while parsing, burst when parsed, hidden otherwise
	const particlesMode: 'hidden' | 'float' | 'burst' = parsed ? 'burst' : (isParsing ? 'float' : 'hidden')

	// Cycle cosmetic parsing messages with the same entrance/exit animation as "Welcome"
	useEffect(() => {
		if (!isParsing || parsed) {
			setShowParsingText(false)
			return
		}

		let cancelled = false
		let hideTimer: ReturnType<typeof setTimeout> | undefined
		let nextTimer: ReturnType<typeof setTimeout> | undefined
		let startTimer: ReturnType<typeof setTimeout> | undefined

		setParsingMessageIndex(0)

		const playAtIndex = (index: number) => {
			if (cancelled) return
			setShowParsingText(true)

			// Show for a bit, then hide
			hideTimer = setTimeout(() => {
				if (cancelled) return
				setShowParsingText(false)
			}, 2000)

			// After hide, move to next
			nextTimer = setTimeout(() => {
				if (cancelled) return
				const nextIndex = (index + 1) % PARSING_MESSAGES.length
				setParsingMessageIndex(nextIndex)
				playAtIndex(nextIndex)
			}, 3000)
		}

		// Small delay before starting the sequence
		startTimer = setTimeout(() => playAtIndex(0), 250)

		return () => {
			cancelled = true
			if (hideTimer) clearTimeout(hideTimer)
			if (nextTimer) clearTimeout(nextTimer)
			if (startTimer) clearTimeout(startTimer)
		}
	}, [isParsing, parsed])

	return (
		<div className={cn('max-w-4xl mx-auto flex flex-col items-center mt-8', className)}>
			<motion.div
				className="text-xl text-center max-w-xl"
				initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
			>
				<p>We need a few details about you to craft the perfect resume for you</p>

				<div className="mt-10">
					<div className={cn(
						'h-64 w-full bg-neutral-100 p-2 rounded-3xl relative',
						isParsing && 'loading-gradient-color lg-flame'
					)}
					>
						{/* Floating/bursting particles overlay tied to parsing lifecycle */}
						<ParticlesBurst playKey={particlesSeed} mode={particlesMode} className="z-20" />
						<div
							className={cn(
								'h-full w-full bg-neutral-50 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer',
								isDragging && 'ring-2 ring-orange-400 ring-offset-2'
							)}
							onDragOver={handleDragOver}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={handleOpenFileDialog}
							onKeyDown={handleKeyDown}
							role="button"
							aria-label="Click or drop your resume here (.pdf, .txt, .doc, .docx, .rtf, .odt)"
							aria-disabled={isParsing}
							aria-busy={isParsing}
							tabIndex={0}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept={ACCEPT_ATTRIBUTE}
								onChange={handleFileInputChange}
								className="sr-only pointer-events-none"
								disabled={isParsing}
							/>
							<AnimatePresence mode="wait">
								{!isDragging && !isParsing && <motion.div key="DEFAULT_STATE" {...DEFAULT_SLIDE_ANIMATION} className="pointer-events-none">
									<div className="border-4 opacity-60 p-4 rounded-3xl w-min mx-auto">
										<FileCheck className="w-10 h-10" />
									</div>

									<p className="mt-4">Do you already have an existing resume?</p>
									<p className="text-sm mt-2 opacity-60">Upload it and we will magically understand key information about you and you won't have to enter the details manually</p>
								</motion.div>}

								{isDragging && !isParsing && <motion.div key="DRAGGING_STATE" {...DEFAULT_SLIDE_ANIMATION} className="pointer-events-none">
									<p className="mt-4">Yes, let go</p>
								</motion.div>}

								{isParsing && !isDragging && (
									<motion.div key="PARSING_STATE" {...DEFAULT_SLIDE_ANIMATION} className="pointer-events-none" role="status" aria-live="polite">
										<StaggeredText
											text={PARSING_MESSAGES[parsingMessageIndex]}
											show={showParsingText}
											className="text-base md:text-lg text-center"
										/>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
							{parsed && (
								<motion.div
									key="PARSED_OVERLAY"
									className="absolute inset-0 bg-neutral-50 z-10 rounded-3xl"
									initial={{opacity: 0, scale: 0.85}}
									animate={{opacity: 1, scale: 1}}
									exit={{opacity: 0, scale: 0.95}}
									transition={{type: 'spring', duration: 0.5, bounce: 0.35}}
								>
									<div className="w-full rounded-3xl ring-fade-orange overflow-hidden flex flex-col items-center justify-center px-6 py-12">
										<p className="font-medium text-orange-500 text-xl">Wow! That worked! 🎉</p>
										<p className="mt-2 text-sm w-80  opacity-75">We've understood a lot about you from your resume. See you on the other side</p>
									</div>

									<div className="w-3/4 bg-neutral-100 mx-auto rounded-b-3xl p-4 border-x-2 border-b-2 border-neutral-300">
										<p className="text-sm">You don't need to enter your details manually anymore. On the next step we'll show you your base resume</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<AnimatePresence mode="wait">
						{!parsed && <motion.div {...DEFAULT_FADE_ANIMATION} className="mt-12" key="MANUAL_DETAILS_CTA">
							<Button onClick={toggleParseResume} variant="outline" size="lg" key="MANUAL_DETAILS_CTA_BUTTON">Enter the details manually</Button>
							<p className="text-xs mt-2 opacity-50 w-80 mx-auto text-center" key="MANUAL_DETAILS_CTA_TEXT">We would ask for your educations and experiences on the next steps</p>
						</motion.div>}

						{parsed && <motion.div {...DEFAULT_FADE_ANIMATION} className="mt-12" key="RESUME_PARSED_CTA">
							<Button onClick={() => router.push('/app/onboarding?step=resume')} size="lg">Let's get your base resume</Button>
							<p className="text-xs mt-2 opacity-50 w-80 mx-auto text-center">Your base resume is ready, click to get started</p>
						</motion.div>}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	)
}

export default ParseResume
