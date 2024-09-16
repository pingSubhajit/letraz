import {notFound} from 'next/navigation'

const CraftPage = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
	const stringifiedJob = searchParams.input as string | undefined

	if (!stringifiedJob) {
		notFound()
	}

	const job = JSON.parse(stringifiedJob)

	return (
		<div style={{viewTransitionName: 'craft_container'}} className="bg-neutral-50">
			<h1>Craft</h1>
			<p>Welcome to the craft page!</p>
		</div>
	)
}

export default CraftPage
