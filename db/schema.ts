import {waitlist, WaitlistInsert, WaitlistSelect} from '@/db/waitlist.schema'
import {jobs} from '@/db/jobs.schema'
import {personalInfo, PersonalInfoInsert, PersonalInfoSelect} from '@/db/personalInfo.schema'
import {educations, EducationsInsert, EducationsSelect} from '@/db/education.schema'
import {
	resumes,
	resumeSections,
	resumeSectionsRelations,
	resumeSectionTypeEnum,
	resumesRelations
} from '@/db/resumes.schema'

export {
	waitlist,
	jobs,
	personalInfo,
	educations
}

export {
	WaitlistInsert, WaitlistSelect,
	PersonalInfoInsert, PersonalInfoSelect,
	EducationsInsert, EducationsSelect,
	resumes, resumeSections, resumesRelations, resumeSectionsRelations, resumeSectionTypeEnum
}
