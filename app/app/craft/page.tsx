import {notFound} from 'next/navigation'
import {JobSummaryFromJson} from '@/components/JobSummary'
import {db} from '@/db/drizzle'
import {eq} from 'drizzle-orm'
import {jobs} from '@/db/schema'

const CraftPage = async ({searchParams}: { searchParams: { [key: string]: string | string[] | undefined } }) => {
	const jobId = searchParams.jobId as string | undefined

	if (!jobId) {
		notFound()
	}

	const job = await db.query.jobs.findFirst({
		where: eq(jobs.id, jobId)
	})

	if (!job) {
		notFound()
	}

	return (
		<div className="flex gap-32">
			<div className="w-full">
				<JobSummaryFromJson jobDetails={job}/>
			</div>

			<div className="w-full">

			</div>
		</div>
	)
}

export default CraftPage
