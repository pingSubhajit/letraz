'use client'

import {Resume} from '@/db/resumes.schema'
import {cn} from '@/lib/utils'

const ResumeEditor = ({resume, className}: {resume:Resume, className?: string}) => {
	return (
		<div className={cn('', className)}>
			<h1>ResumeEditor</h1>
		</div>
	)
}

export default ResumeEditor
