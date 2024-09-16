import {notFound} from 'next/navigation'
import {JobSummaryFromJson} from '@/components/JobSummary'

const CraftPage = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
	const stringifiedJob = searchParams.input as string | undefined

	if (!stringifiedJob) {
		notFound()
	}

	const job = JSON.parse(stringifiedJob)

	return (
		<div className="flex gap-32">
			{/*<video autoPlay muted loop*/}
			{/*       className="aspect-video absolute -z-10 w-full h-full left-1/2 -translate-x-1/2 -top-96">*/}
			{/*	<source src="/letraz-brain.webm" type="video/webm"/>*/}
			{/*</video>*/}

			<div className="w-full">
				<JobSummaryFromJson jobDetails={job}/>
			</div>

			<div className="w-full">

			</div>
		</div>
	)
}

export default CraftPage
