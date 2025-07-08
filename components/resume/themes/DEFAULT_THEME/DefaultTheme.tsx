import {createTheme} from '@/components/resume/themes/ThemeFactory'
import PersonalInfoSection from '@/components/resume/themes/DEFAULT_THEME/sections/PersonalInfoSection'
import EducationSection from '@/components/resume/themes/DEFAULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEFAULT_THEME/sections/ExperienceSection'
import EducationTitle from '@/components/resume/themes/DEFAULT_THEME/sections/EducationTitle'
import ExperienceTitle from '@/components/resume/themes/DEFAULT_THEME/sections/ExperienceTitle'

// Create the default theme using the theme factory
const DefaultTheme = createTheme({
	components: {
		PersonalInfoSection,
		EducationSection,
		ExperienceSection,
		EducationTitle,
		ExperienceTitle
	}
	/*
	 * Additional theme-specific configuration can be added here
	 * className: 'custom-default-theme-styles'
	 */
})

export default DefaultTheme
