import {Suspense} from 'react'
import type {Metadata} from 'next'
import ProcessingView from './processing.client'
import {notFound} from 'next/navigation'
import {getResumeFromDB, getResumeMinimal} from '@/lib/resume/actions'

type PageProps = {
  params: Promise<{ resumeId: string }>
}

export const generateMetadata = async (
	props: { params: Promise<{ resumeId: string }> }
): Promise<Metadata> => {
	try {
		const {resumeId} = await props.params
		const resume = await getResumeMinimal(resumeId)

		if (!resume) {
			notFound()
		}

		if (resume.base) {
			return {
				title: 'Base Resume - Letraz',
				description: 'This is the base resume. This is the master resume for tailoring.'
			}
		}

		if (resume.status === 'Failed') {
			return {
				title: 'Resume Processing Failed - Letraz',
				description: 'We couldn\'t process your resume. Please try again.'
			}
		}

		if (resume.status === 'Processing') {
			return {
				title: 'Crafting Resume - Letraz',
				description: 'We are processing your resume. This can take a few moments.'
			}
		}

		return {
			title: `${resume.job_title} at ${resume.company_name} - Letraz`,
			description: `Here is your tailored resume for the ${resume.job_title} role at ${resume.company_name}. Happy applying!`
		}
	} catch {
		notFound()
	}
}

const ResumeProcessingPage = async ({params}: PageProps) => {
	const {resumeId} = await params

	// Server-side existence check: render app/not-found.tsx if resume is missing
	try {
		await getResumeFromDB(resumeId)
	} catch (err) {
		const message = err instanceof Error ? err.message.toLowerCase() : ''
		if (message.includes('resume not found')) {
			notFound()
		}
		// For other errors, proceed to client view where generic error/processing UI handles it
	}
	return (
		<Suspense fallback={<div className="flex h-screen w-full" role="main">
			<div className="shadow-2xl bg-neutral-50 size-a4 max-h-screen relative" />
			<div className="size-full bg-neutral-50" />
		</div>}>
			<ProcessingView resumeId={resumeId} />
		</Suspense>
	)
}

export default ResumeProcessingPage
