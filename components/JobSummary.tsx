'use client'

import {useCompletion} from 'ai/react'
import {useEffect} from 'react'
import {cn} from '@/lib/utils'
import AiLoading from '@/components/utilities/AiLoading'
import {jobs} from '@/db/schema'

export const JobSummary = ({jobDetails, loading, className}: {
	jobDetails: string,
	loading?: boolean,
	className?: string
}) => {
	return (
		<div
			style={{viewTransitionName: 'craft_container'}}
			className={cn(
				'bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl relative min-h-72',
				className
			)}
		>
			{!loading && <div dangerouslySetInnerHTML={{__html: jobDetails}} className="prose-sm" />}

			<AiLoading loading={loading ?? false} text="Understanding the job requirements" />
		</div>
	)
}

export const JobSummaryFromJson = ({jobDetails}: { jobDetails: typeof jobs.$inferSelect}) => {
	const {completion, isLoading, handleSubmit} = useCompletion({
		api: '/app/craft/summarize',
		initialInput: JSON.stringify(jobDetails)
	})

	useEffect(() => {
		handleSubmit()
	}, [])

	const summary = 'Job Summary'

	return (
		<div>
			<JobSummary jobDetails={completion} loading={isLoading}/>
		</div>
	)
}
