import {waitlist, WaitlistInsert, WaitlistSelect} from '@/db/waitlist.schema'
import {jobs} from '@/db/jobs.schema'
import {personalInfo, PersonalInfoInsert, PersonalInfoSelect} from '@/db/personalInfo.schema'

export {
	waitlist,
	jobs,
	personalInfo
}

export {
	WaitlistInsert, WaitlistSelect,
	PersonalInfoInsert, PersonalInfoSelect
}
