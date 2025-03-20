import {QueryClient} from '@tanstack/react-query'


import ResumeView from '@/components/resume/ResumeView'

import {getResumeFromDB} from '@/lib/resume/actions'
import {baseResultQueryOptions} from '@/lib/resume/queries'


const BaseResume = async () => {


	const queryClient = new QueryClient()

	// prefetch base resume data
	await queryClient.prefetchQuery(baseResultQueryOptions)

	return (
		<div className="w-full h-full flex flex-col justify-start">
			<ResumeView />
		</div>
	)
}

export default BaseResume
