import {getResumeFromDB} from '@/lib/resume/actions'
import ResumeView from '@/components/resume/ResumeView'

const BaseResume = async () => {
	const baseResume = await getResumeFromDB('base')

	return (
		<div className="w-full h-full flex flex-col justify-start">
			<ResumeView resume={baseResume} />
		</div>
	)
}

export default BaseResume
