import {notFound} from 'next/navigation'

const CraftPage = async (
	props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) => {
	const searchParams = await props.searchParams
	const jobId = searchParams.jobId as string | undefined

	if (!jobId) {
		notFound()
	}

	return (
		<div className="flex gap-32">
			<div className="w-full">
				Job summary will come here
			</div>

			<div className="w-full">

			</div>
		</div>
	)
}

export default CraftPage
