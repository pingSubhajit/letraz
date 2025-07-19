import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import DefaultTheme from '@/components/resume/themes/DEFAULT_THEME/DefaultTheme'
import {ThemeProps} from '@/components/resume/themes/ThemeFactory'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'

// --- Mock Data ---
const mockPersonalInfo: UserInfo = {
	id: '1',
	title: 'Dr.',
	first_name: 'Jane',
	last_name: 'Smith',
	email: 'jane@example.com',
	phone: '+1987654321',
	dob: new Date('1985-05-15'),
	address: '456 Oak Ave',
	city: 'Boston',
	country: {code: 'US', name: 'United States'},
	nationality: 'American',
	postal: '02101',
	profile_text: 'Experienced doctor',
	website: 'https://drjanesmith.com',
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z'
}

const mockEducationSection: ResumeSection = {
	id: 'edu-1',
	type: 'Education',
	resume: 'resume-1',
	index: 1,
	data: {
		id: 'education-1',
		user: 'user-1',
		resume_section: 'edu-1',
		institution_name: 'Harvard Medical School',
		field_of_study: 'Medicine',
		degree: 'MD',
		country: {code: 'US', name: 'United States'},
		started_from_month: 9,
		started_from_year: 2015,
		finished_at_month: 5,
		finished_at_year: 2019,
		current: false,
		description: 'Medical degree with focus on cardiology',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	}
}

const mockExperienceSection: ResumeSection = {
	id: 'exp-1',
	type: 'Experience',
	resume: 'resume-1',
	index: 2,
	data: {
		id: 'experience-1',
		user: 'user-1',
		resume_section: 'exp-1',
		job_title: 'Senior Cardiologist',
		company_name: 'Boston General Hospital',
		employment_type: 'Full-time',
		city: 'Boston',
		country: {code: 'US', name: 'United States'},
		started_from_month: 7,
		started_from_year: 2019,
		finished_at_month: null,
		finished_at_year: null,
		current: true,
		description: 'Leading cardiology department',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	}
}

// --- Mocks ---
vi.mock('@/components/providers/SmoothScrollProvider', () => ({
	__esModule: true,
	default: ({children, className}: any) => (
		<div data-testid="smooth-scroll-provider" className={className}>
			{children}
		</div>
	)
}))

vi.mock('@/components/resume/ReorderableSections', () => ({
	__esModule: true,
	default: ({sections, resumeId, renderSection}: any) => (
		<div data-testid="reorderable-sections" data-resume-id={resumeId}>
			{sections.map((section: ResumeSection, index: number) => {
				const isFirstInGroup = index === 0 || sections[index - 1].type !== section.type
				const {title, content} = renderSection(section, isFirstInGroup)
				return (
					<div key={section.id} data-testid={`section-${section.type.toLowerCase()}`}>
						{title}
						{content}
					</div>
				)
			})}
		</div>
	)
}))

vi.mock('@/components/resume/controllers/PersonalInfoController', () => ({
	PersonalInfoController: ({children, personalInfoData}: any) => {
		return children(personalInfoData)
	}
}))

vi.mock('@/components/resume/controllers/EducationController', () => ({
	EducationController: ({children, section}: any) => {
		return children(section.data)
	}
}))

vi.mock('@/components/resume/controllers/ExperienceController', () => ({
	ExperienceController: ({children, section}: any) => {
		return children(section.data)
	}
}))

// Mock the theme section components
vi.mock('@/components/resume/themes/DEFAULT_THEME/sections/PersonalInfoSection', () => ({
	__esModule: true,
	default: ({data}: any) => (
		<div data-testid="default-personal-info-section">
			<h1>{data?.title} {data?.first_name} {data?.last_name}</h1>
			<p>{data?.email}</p>
			<p>{data?.phone}</p>
			{data?.profile_text && <div>{data.profile_text}</div>}
		</div>
	)
}))

vi.mock('@/components/resume/themes/DEFAULT_THEME/sections/EducationSection', () => ({
	__esModule: true,
	default: ({data}: any) => (
		<div data-testid="default-education-section">
			<h3>{data?.degree} in {data?.field_of_study}</h3>
			<p>{data?.institution_name}</p>
			{data?.description && <p>{data.description}</p>}
		</div>
	)
}))

vi.mock('@/components/resume/themes/DEFAULT_THEME/sections/ExperienceSection', () => ({
	__esModule: true,
	default: ({data}: any) => (
		<div data-testid="default-experience-section">
			<h3>{data?.job_title}</h3>
			<p>{data?.company_name}</p>
			<p>{data?.employment_type}</p>
			{data?.description && <p>{data.description}</p>}
		</div>
	)
}))

vi.mock('@/components/resume/themes/DEFAULT_THEME/sections/EducationTitle', () => ({
	__esModule: true,
	default: () => (
		<h2 data-testid="default-education-title" className="section-title">
			Education
		</h2>
	)
}))

vi.mock('@/components/resume/themes/DEFAULT_THEME/sections/ExperienceTitle', () => ({
	__esModule: true,
	default: () => (
		<h2 data-testid="default-experience-title" className="section-title">
			Experience
		</h2>
	)
}))

// Mock the font and styles
vi.mock('@/components/resume/themes/DEFAULT_THEME/fonts', () => ({
	charter: {
		className: 'charter-font'
	}
}))

vi.mock('@/components/resume/themes/DEFAULT_THEME/fontawesome', () => ({}))
vi.mock('@/components/resume/themes/DEFAULT_THEME/styles.css', () => ({}))

// --- Tests ---
describe('DefaultTheme', () => {
	let mockThemeProps: ThemeProps

	beforeEach(() => {
		vi.clearAllMocks()

		mockThemeProps = {
			sections: [mockEducationSection, mockExperienceSection],
			personalInfoData: mockPersonalInfo,
			resumeId: 'resume-1'
		}
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Theme Rendering', () => {
		it('renders the default theme successfully', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			expect(screen.getByTestId('smooth-scroll-provider')).toBeInTheDocument()
			expect(screen.getByTestId('default-personal-info-section')).toBeInTheDocument()
			expect(screen.getByTestId('reorderable-sections')).toBeInTheDocument()
		})

		it('applies Charter font and default theme container class', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			expect(smoothScrollProvider).toHaveClass('charter-font')
			expect(smoothScrollProvider).toHaveClass('default-theme-container')
			expect(smoothScrollProvider).toHaveClass('h-full', 'p-12', 'overflow-y-auto')
		})

		it('renders personal info section with default theme styling', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const personalInfoSection = screen.getByTestId('default-personal-info-section')
			expect(personalInfoSection).toBeInTheDocument()
			expect(personalInfoSection).toHaveTextContent('Dr. Jane Smith')
			expect(personalInfoSection).toHaveTextContent('jane@example.com')
			expect(personalInfoSection).toHaveTextContent('+1987654321')
			expect(personalInfoSection).toHaveTextContent('Experienced doctor')
		})

		it('renders education section with default theme styling', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const educationSection = screen.getByTestId('default-education-section')
			expect(educationSection).toBeInTheDocument()
			expect(educationSection).toHaveTextContent('MD in Medicine')
			expect(educationSection).toHaveTextContent('Harvard Medical School')
			expect(educationSection).toHaveTextContent('Medical degree with focus on cardiology')
		})

		it('renders experience section with default theme styling', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const experienceSection = screen.getByTestId('default-experience-section')
			expect(experienceSection).toBeInTheDocument()
			expect(experienceSection).toHaveTextContent('Senior Cardiologist')
			expect(experienceSection).toHaveTextContent('Boston General Hospital')
			expect(experienceSection).toHaveTextContent('Full-time')
			expect(experienceSection).toHaveTextContent('Leading cardiology department')
		})

		it('renders section titles with default theme styling', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const educationTitle = screen.getByTestId('default-education-title')
			const experienceTitle = screen.getByTestId('default-experience-title')

			expect(educationTitle).toBeInTheDocument()
			expect(educationTitle).toHaveTextContent('Education')
			expect(educationTitle).toHaveClass('section-title')

			expect(experienceTitle).toBeInTheDocument()
			expect(experienceTitle).toHaveTextContent('Experience')
			expect(experienceTitle).toHaveClass('section-title')
		})
	})

	describe('Theme Configuration', () => {
		it('uses all required theme components', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			// Verify all theme components are rendered
			expect(screen.getByTestId('default-personal-info-section')).toBeInTheDocument()
			expect(screen.getByTestId('default-education-section')).toBeInTheDocument()
			expect(screen.getByTestId('default-experience-section')).toBeInTheDocument()
			expect(screen.getByTestId('default-education-title')).toBeInTheDocument()
			expect(screen.getByTestId('default-experience-title')).toBeInTheDocument()
		})

		it('works without sections', () => {
			render(<DefaultTheme personalInfoData={mockPersonalInfo} />)

			expect(screen.getByTestId('default-personal-info-section')).toBeInTheDocument()
			expect(screen.queryByTestId('reorderable-sections')).not.toBeInTheDocument()
		})

		it('works without personal info data', () => {
			render(<DefaultTheme sections={[mockEducationSection]} resumeId="resume-1" />)

			expect(screen.getByTestId('default-personal-info-section')).toBeInTheDocument()
			expect(screen.getByTestId('reorderable-sections')).toBeInTheDocument()
		})

		it('handles empty sections array', () => {
			render(<DefaultTheme {...mockThemeProps} sections={[]} />)

			expect(screen.getByTestId('default-personal-info-section')).toBeInTheDocument()
			expect(screen.queryByTestId('reorderable-sections')).not.toBeInTheDocument()
		})

		it('requires resumeId to render sections', () => {
			render(<DefaultTheme {...mockThemeProps} resumeId={undefined} />)

			expect(screen.getByTestId('default-personal-info-section')).toBeInTheDocument()
			expect(screen.queryByTestId('reorderable-sections')).not.toBeInTheDocument()
		})
	})

	describe('Theme Integration', () => {
		it('integrates with ThemeFactory correctly', () => {
			// Verify that DefaultTheme is a React component (function)
			expect(typeof DefaultTheme).toBe('function')

			// Verify it renders without errors
			expect(() => {
				render(<DefaultTheme {...mockThemeProps} />)
			}).not.toThrow()
		})

		it('passes data correctly to theme components', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			// Verify personal info data is passed correctly
			const personalInfoSection = screen.getByTestId('default-personal-info-section')
			expect(personalInfoSection).toHaveTextContent('Dr. Jane Smith')

			// Verify education data is passed correctly
			const educationSection = screen.getByTestId('default-education-section')
			expect(educationSection).toHaveTextContent('Harvard Medical School')

			// Verify experience data is passed correctly
			const experienceSection = screen.getByTestId('default-experience-section')
			expect(experienceSection).toHaveTextContent('Boston General Hospital')
		})

		it('maintains section order', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const sections = screen.getAllByTestId(/^section-/)
			expect(sections[0]).toHaveAttribute('data-testid', 'section-education')
			expect(sections[1]).toHaveAttribute('data-testid', 'section-experience')
		})

		it('handles multiple sections of the same type', () => {
			const secondEducationSection: ResumeSection = {
				...mockEducationSection,
				id: 'edu-2',
				data: {
					...mockEducationSection.data,
					id: 'education-2',
					institution_name: 'MIT',
					field_of_study: 'Computer Science',
					degree: 'PhD'
				}
			}

			const sectionsWithDuplicates = [mockEducationSection, secondEducationSection, mockExperienceSection]

			render(<DefaultTheme {...mockThemeProps} sections={sectionsWithDuplicates} />)

			// Should only render one education title (for the first in group)
			const educationTitles = screen.getAllByTestId('default-education-title')
			expect(educationTitles).toHaveLength(1)

			// But should render both education sections
			const educationSections = screen.getAllByTestId('default-education-section')
			expect(educationSections).toHaveLength(2)
		})
	})

	describe('Theme Styling', () => {
		it('applies correct CSS classes', () => {
			render(<DefaultTheme {...mockThemeProps} />)

			const container = screen.getByTestId('smooth-scroll-provider')
			expect(container).toHaveClass('charter-font')
			expect(container).toHaveClass('default-theme-container')
			expect(container).toHaveClass('h-full')
			expect(container).toHaveClass('p-12')
			expect(container).toHaveClass('overflow-y-auto')
		})

		it('renders gradient overlay', () => {
			const {container} = render(<DefaultTheme {...mockThemeProps} />)

			const gradientOverlay = container.querySelector('.absolute.w-full.h-24.bg-gradient-to-b')
			expect(gradientOverlay).toBeInTheDocument()
			expect(gradientOverlay).toHaveClass('from-transparent', 'to-neutral-50', 'bottom-0', 'inset-x-0')
		})
	})

	describe('Theme Props Interface', () => {
		it('accepts all ThemeProps properties', () => {
			const fullProps: ThemeProps = {
				sections: [mockEducationSection, mockExperienceSection],
				personalInfoData: mockPersonalInfo,
				resumeRef: {current: null},
				resumeId: 'resume-1'
			}

			expect(() => {
				render(<DefaultTheme {...fullProps} />)
			}).not.toThrow()
		})

		it('works with minimal props', () => {
			expect(() => {
				render(<DefaultTheme />)
			}).not.toThrow()
		})

		it('handles resumeRef prop', () => {
			const resumeRef = {current: null}

			expect(() => {
				render(<DefaultTheme {...mockThemeProps} resumeRef={resumeRef} />)
			}).not.toThrow()
		})
	})
})
