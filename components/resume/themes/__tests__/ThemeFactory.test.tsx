import React from 'react'
import {render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createTheme, ThemeConfig, ThemeProps} from '../ThemeFactory'
import {ResumeSection} from '@/lib/resume/types'
import {UserInfo} from '@/lib/user-info/types'

// --- Mock Components ---
const MockPersonalInfoSection = ({data}: any) => (
	<div data-testid="personal-info-section">
		Personal Info: {data?.first_name} {data?.last_name}
	</div>
)

const MockEducationSection = ({data}: any) => (
	<div data-testid="education-section">
		Education: {data?.institution_name}
	</div>
)

const MockExperienceSection = ({data}: any) => (
	<div data-testid="experience-section">
		Experience: {data?.company_name}
	</div>
)

const MockEducationTitle = () => (
	<h2 data-testid="education-title">Education</h2>
)

const MockExperienceTitle = () => (
	<h2 data-testid="experience-title">Experience</h2>
)

// --- Mock Data ---
const mockPersonalInfo: UserInfo = {
	id: '1',
	title: 'Mr.',
	first_name: 'John',
	last_name: 'Doe',
	email: 'john@example.com',
	phone: '+1234567890',
	dob: new Date('1990-01-01'),
	address: '123 Main St',
	city: 'New York',
	country: {code: 'US', name: 'United States'},
	nationality: 'American',
	postal: '10001',
	profile_text: 'Software engineer',
	website: 'https://johndoe.com',
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
		institution_name: 'Test University',
		field_of_study: 'Computer Science',
		degree: 'Bachelor',
		country: {code: 'US', name: 'United States'},
		started_from_month: 9,
		started_from_year: 2018,
		finished_at_month: 5,
		finished_at_year: 2022,
		current: false,
		description: 'Computer Science degree',
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
		job_title: 'Software Engineer',
		company_name: 'Tech Corp',
		employment_type: 'Full-time',
		city: 'San Francisco',
		country: {code: 'US', name: 'United States'},
		started_from_month: 6,
		started_from_year: 2022,
		finished_at_month: null,
		finished_at_year: null,
		current: true,
		description: 'Software development role',
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

// --- Tests ---
describe('ThemeFactory', () => {
	let mockThemeConfig: ThemeConfig
	let mockThemeProps: ThemeProps

	beforeEach(() => {
		vi.clearAllMocks()

		mockThemeConfig = {
			components: {
				PersonalInfoSection: MockPersonalInfoSection,
				EducationSection: MockEducationSection,
				ExperienceSection: MockExperienceSection,
				EducationTitle: MockEducationTitle,
				ExperienceTitle: MockExperienceTitle
			},
			className: 'test-theme-class'
		}

		mockThemeProps = {
			sections: [mockEducationSection, mockExperienceSection],
			personalInfoData: mockPersonalInfo,
			resumeId: 'resume-1'
		}
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('createTheme', () => {
		it('creates a theme component with the provided configuration', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			expect(typeof ThemeComponent).toBe('function')
		})

		it('renders the theme with all required components', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			expect(screen.getByTestId('smooth-scroll-provider')).toBeInTheDocument()
			expect(screen.getByTestId('personal-info-section')).toBeInTheDocument()
			expect(screen.getByTestId('reorderable-sections')).toBeInTheDocument()
		})

		it('applies custom className to the theme', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			expect(smoothScrollProvider).toHaveClass('test-theme-class')
			expect(smoothScrollProvider).toHaveClass('h-full', 'p-12', 'overflow-y-auto')
		})

		it('renders personal info section with correct data', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			const personalInfoSection = screen.getByTestId('personal-info-section')
			expect(personalInfoSection).toHaveTextContent('Personal Info: John Doe')
		})

		it('renders sections when provided', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			expect(screen.getByTestId('reorderable-sections')).toBeInTheDocument()
			expect(screen.getByTestId('section-education')).toBeInTheDocument()
			expect(screen.getByTestId('section-experience')).toBeInTheDocument()
		})

		it('does not render sections when sections array is empty', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} sections={[]} />)

			expect(screen.queryByTestId('reorderable-sections')).not.toBeInTheDocument()
		})

		it('does not render sections when resumeId is not provided', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} resumeId={undefined} />)

			expect(screen.queryByTestId('reorderable-sections')).not.toBeInTheDocument()
		})

		it('renders education section with correct data', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			const educationSection = screen.getByTestId('education-section')
			expect(educationSection).toHaveTextContent('Education: Test University')
		})

		it('renders experience section with correct data', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			const experienceSection = screen.getByTestId('experience-section')
			expect(experienceSection).toHaveTextContent('Experience: Tech Corp')
		})

		it('renders section titles for first items in groups', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			expect(screen.getByTestId('education-title')).toBeInTheDocument()
			expect(screen.getByTestId('experience-title')).toBeInTheDocument()
		})

		it('handles multiple sections of the same type correctly', () => {
			const secondEducationSection: ResumeSection = {
				...mockEducationSection,
				id: 'edu-2',
				data: {
					...mockEducationSection.data,
					id: 'education-2',
					institution_name: 'Another University'
				}
			}

			const sectionsWithDuplicates = [mockEducationSection, secondEducationSection, mockExperienceSection]
			const ThemeComponent = createTheme(mockThemeConfig)

			render(<ThemeComponent {...mockThemeProps} sections={sectionsWithDuplicates} />)

			// Should only render one education title (for the first in group)
			const educationTitles = screen.getAllByTestId('education-title')
			expect(educationTitles).toHaveLength(1)
		})

		it('works without personal info data', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} personalInfoData={undefined} />)

			expect(screen.getByTestId('personal-info-section')).toBeInTheDocument()
		})

		it('works without custom className', () => {
			const configWithoutClassName = {
				...mockThemeConfig,
				className: undefined
			}
			const ThemeComponent = createTheme(configWithoutClassName)
			render(<ThemeComponent {...mockThemeProps} />)

			const smoothScrollProvider = screen.getByTestId('smooth-scroll-provider')
			expect(smoothScrollProvider).toHaveClass('h-full', 'p-12', 'overflow-y-auto')
			expect(smoothScrollProvider).not.toHaveClass('test-theme-class')
		})

		it('renders gradient overlay at the bottom', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			const {container} = render(<ThemeComponent {...mockThemeProps} />)

			const gradientOverlay = container.querySelector('.absolute.w-full.h-24.bg-gradient-to-b')
			expect(gradientOverlay).toBeInTheDocument()
			expect(gradientOverlay).toHaveClass('from-transparent', 'to-neutral-50', 'bottom-0', 'inset-x-0')
		})

		it('passes resumeId to ReorderableSections', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			const reorderableSections = screen.getByTestId('reorderable-sections')
			expect(reorderableSections).toHaveAttribute('data-resume-id', 'resume-1')
		})

		it('handles unknown section types gracefully', () => {
			const unknownSection: ResumeSection = {
				id: 'unknown-1',
				type: 'Unknown' as any,
				resume: 'resume-1',
				index: 3,
				data: {},
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			} as unknown as ResumeSection

			const sectionsWithUnknown = [...mockThemeProps.sections!, unknownSection]
			const ThemeComponent = createTheme(mockThemeConfig)

			// Should not throw an error
			expect(() => {
				render(<ThemeComponent {...mockThemeProps} sections={sectionsWithUnknown} />)
			}).not.toThrow()
		})

		it('maintains section order', () => {
			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} />)

			const sections = screen.getAllByTestId(/^section-/)
			expect(sections[0]).toHaveAttribute('data-testid', 'section-education')
			expect(sections[1]).toHaveAttribute('data-testid', 'section-experience')
		})

		it('provides correct isFirstInGroup flag to controllers', () => {
			/*
			 * This is tested indirectly through the title rendering logic
			 * First education section should render title, subsequent ones should not
			 */
			const multipleEducationSections = [
				mockEducationSection,
				{...mockEducationSection, id: 'edu-2'},
				mockExperienceSection
			]

			const ThemeComponent = createTheme(mockThemeConfig)
			render(<ThemeComponent {...mockThemeProps} sections={multipleEducationSections} />)

			// Should only have one education title despite multiple education sections
			expect(screen.getAllByTestId('education-title')).toHaveLength(1)
			expect(screen.getAllByTestId('experience-title')).toHaveLength(1)
		})
	})

	describe('Theme Configuration', () => {
		it('accepts all required theme components', () => {
			const config: ThemeConfig = {
				components: {
					PersonalInfoSection: MockPersonalInfoSection,
					EducationSection: MockEducationSection,
					ExperienceSection: MockExperienceSection,
					EducationTitle: MockEducationTitle,
					ExperienceTitle: MockExperienceTitle
				}
			}

			expect(() => createTheme(config)).not.toThrow()
		})

		it('works with minimal configuration', () => {
			const minimalConfig: ThemeConfig = {
				components: {
					PersonalInfoSection: () => <div>Personal Info</div>,
					EducationSection: () => <div>Education</div>,
					ExperienceSection: () => <div>Experience</div>,
					EducationTitle: () => <div>Education Title</div>,
					ExperienceTitle: () => <div>Experience Title</div>
				}
			}

			const ThemeComponent = createTheme(minimalConfig)
			expect(() => {
				render(<ThemeComponent personalInfoData={mockPersonalInfo} />)
			}).not.toThrow()
		})
	})
})
