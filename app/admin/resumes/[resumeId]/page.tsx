import {notFound, redirect} from 'next/navigation'
import ResumeViewer from '@/components/resume/ResumeViewer'
import {Resume} from '@/lib/resume/types'

type PageProps = {
	params: Promise<{ resumeId: string }>
	searchParams: Promise<{ token?: string }>
}

const fetchResumeData = async (resumeId: string): Promise<Resume> => {
	const backendUrl = `${process.env.API_URL}/admin/resumes/${resumeId}`

	const response = await fetch(backendUrl, {
		method: 'GET',
		headers: {
			'x-admin-api-key': process.env.BACKEND_ADMIN_API_KEY,
			'Content-Type': 'application/json'
		},
		cache: 'no-store' // Don't cache for screenshot generation
	})

	if (!response.ok) {
		if (response.status === 404) {
			notFound()
		}
		throw new Error(`Failed to fetch resume: ${response.status}`)
	}

	return response.json()
}


export const generateMetadata = async (props: PageProps) => {
	const params = await props.params

	return ({
		title: `Resume Preview - ${params.resumeId}`,
		description: 'Resume preview for screenshot generation',

		// Prevent search engine indexing
		robots: 'noindex, nofollow'
	})
}

const AdminResumePage = async (props: PageProps) => {
	const searchParams = await props.searchParams
	const params = await props.params
	const {resumeId} = params
	const {token} = searchParams

	// Validate token authentication
	if (!token || token !== process.env.SELF_SECRET_KEY) {
		redirect('/')
	}

	try {
		const resume = await fetchResumeData(resumeId)

		return (
			<div className="bg-neutral-300 h-screen">
				<div className="flex justify-center">
					<ResumeViewer
						resume={resume}
						className="h-full"
						showAnimation={false}
					/>
				</div>
			</div>
		)
	} catch (error) {
		notFound()
	}
}

export default AdminResumePage
