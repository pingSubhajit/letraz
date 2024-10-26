import {getBaseResumeFromDB} from '@/lib/resume.methods'
import {auth} from '@clerk/nextjs/server'
import ResumeView from '@/components/resume/ResumeView'

const BaseResume = async () => {
	const {userId} = await auth()
	const baseResume = await getBaseResumeFromDB(userId!)

	return (
		<div className="w-full h-full flex flex-col justify-start pl-16 pt-16">
			<ResumeView resume={baseResume} />
		</div>
	)
}

export default BaseResume
