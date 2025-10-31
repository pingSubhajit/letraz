import './fontawesome'
import './styles.css'
import {charter} from '@/components/resume/themes/DEFAULT_THEME/fonts'
import {createTheme} from '@/components/resume/themes/ThemeFactory'
import PersonalInfoSection from '@/components/resume/themes/DEFAULT_THEME/sections/PersonalInfoSection'
import EducationSection from '@/components/resume/themes/DEFAULT_THEME/sections/EducationSection'
import ExperienceSection from '@/components/resume/themes/DEFAULT_THEME/sections/ExperienceSection'
import SkillsSection from '@/components/resume/themes/DEFAULT_THEME/sections/SkillsSection'
import ProjectsSection from '@/components/resume/themes/DEFAULT_THEME/sections/ProjectsSection'
import CertificationSection from '@/components/resume/themes/DEFAULT_THEME/sections/CertificationSection'
import EducationTitle from '@/components/resume/themes/DEFAULT_THEME/sections/EducationTitle'
import ExperienceTitle from '@/components/resume/themes/DEFAULT_THEME/sections/ExperienceTitle'
import SkillsTitle from '@/components/resume/themes/DEFAULT_THEME/sections/SkillsTitle'
import ProjectsTitle from '@/components/resume/themes/DEFAULT_THEME/sections/ProjectsTitle'
import CertificationTitle from '@/components/resume/themes/DEFAULT_THEME/sections/CertificationTitle'

// Create the default theme using the theme factory
const DefaultTheme = createTheme({
	components: {
		PersonalInfoSection,
		EducationSection,
		ExperienceSection,
		SkillsSection,
		ProjectsSection,
		CertificationSection,
		EducationTitle,
		ExperienceTitle,
		SkillsTitle,
		ProjectsTitle,
		CertificationTitle
	},
	// Apply Charter font and custom container class
	className: `${charter.className} default-theme-container`
})

export default DefaultTheme
