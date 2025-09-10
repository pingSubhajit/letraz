import {notFound} from 'next/navigation'
import type {Metadata} from 'next'

export const generateMetadata = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> => {
	const searchParams = await props.searchParams
	const jobId = searchParams.jobId as string | undefined

	if (!jobId) {
		return {
			title: 'Job not found',
			description: 'Specify a job to start crafting a tailored resume.'
		}
	}

	return {
		title: 'Craft — Tailor your resume',
		description: 'Review the job and tailor your resume for maximum impact.'
	}
}

const CraftPage = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) => {
	const searchParams = await props.searchParams
	const jobId = searchParams.jobId as string | undefined

	if (!jobId) {
		notFound()
	}

	return (
		<div className="p-8 flex gap-32">
			<div className="w-full">
				Job summary will come here
			</div>

			<div className="w-full">

			</div>
		</div>
	)
}

export default CraftPage
