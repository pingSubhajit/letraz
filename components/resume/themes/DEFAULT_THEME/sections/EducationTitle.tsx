import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {cn} from '@/lib/utils'

const EducationTitle = () => {
	const {highlightedItem} = useResumeHighlight()
	const isFormOpen = highlightedItem !== null

	return (
		<div className={cn(charter.className, 'section-header', isFormOpen && 'opacity-20 blur-[1px]')}>
			Education
		</div>
	)
}

export default EducationTitle
