import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import ResumeView from '../ResumeView'
import {useBaseResume} from '@/lib/resume/queries'
import {Resume} from '@/lib/resume/types'

// Mock the child components
vi.mock('../ResumeEditor', () => ({
	default: ({className}: {className?: string}) => (
		<div data-testid="resume-editor" className={className}>
			Resume Editor
		</div>
	)
}))

vi.mock('../ResumeViewer', () => ({
	default: vi.fn().mockImplementation(({resumeRef, resume, className}: {
		resumeRef: React.RefObject<HTMLDivElement>
		resume: Resume
		className?: string
	}) => (
		<div
			data-testid="resume-viewer"
			className={className}
			data-resume-id={resume.id}
		>
			Resume Viewer
		</div>
	))
}))

vi.mock('next/dynamic', () => ({
	__esModule: true,
	default: (importFn: () => Promise<any>, options: {ssr: boolean}) => {
		// Return a component that renders the resume viewer directly
		return (props: any) => (
			<div
				data-testid="resume-viewer"
				data-resume-id={props.resume?.id}
				className={props.className}
				aria-label={props['aria-label']}
				data-ssr={options.ssr}
			>
				Resume Viewer
			</div>
		)
	}
}))

// Mock the resume query
vi.mock('@/lib/resume/queries', () => ({
	useBaseResume: vi.fn()
}))

// Create a mock resume that matches the Resume type
const createMockResumeData = (): Resume => ({
	id: 'resume-123',
	base: true,
	user: {
		id: 'user-123',
		first_name: 'John',
		last_name: 'Doe',
		email: 'john.doe@example.com',
		phone: '+1234567890',
		website: 'https://johndoe.com',
		profile_text: 'Software developer with 5 years of experience',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	job: {
		title: 'Software Engineer',
		company_name: 'Tech Corp',
		description: 'Great opportunity',
		requirements: ['React', 'TypeScript'],
		location: 'Remote',
		job_url: 'https://example.com/job',
		currency: 'USD',
		salary_min: 80000,
		salary_max: 120000,
		responsibilities: ['Build applications'],
		benefits: ['Health insurance']
	},
	sections: [
		{
			id: 'section-1',
			resume: 'resume-123',
			index: 0,
			type: 'Education',
			data: {
				id: 'edu-1',
				user: 'user-123',
				resume_section: 'section-1',
				institution_name: 'Test University',
				degree: 'Bachelor of Science',
				field_of_study: 'Computer Science',
				country: {
					code: 'USA',
					name: 'United States'
				},
				started_from_month: 9,
				started_from_year: 2018,
				finished_at_month: 5,
				finished_at_year: 2022,
				current: false,
				description: 'Studied computer science',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}
		},
		{
			id: 'section-2',
			resume: 'resume-123',
			index: 1,
			type: 'Experience',
			data: {
				id: 'exp-1',
				user: 'user-123',
				resume_section: 'section-2',
				company_name: 'Tech Corp',
				job_title: 'Software Engineer',
				country: {
					code: 'USA',
					name: 'United States'
				},
				city: 'San Francisco',
				employment_type: 'flt',
				started_from_month: 6,
				started_from_year: 2022,
				finished_at_month: 1,
				finished_at_year: 2024,
				current: false,
				description: 'Worked on web applications',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z'
			}
		}
	]
})

describe('ResumeView', () => {
	const mockUseBaseResume = vi.mocked(useBaseResume)

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Loading State', () => {
		it('shows loading message when data is loading', () => {
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.getByText('loading')).toBeInTheDocument()
			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})

		it('shows loading message when there is an error', () => {
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: true,
				error: new Error('Failed to load resume'),
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.getByText('loading')).toBeInTheDocument()
			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})

		it('does not render resume components when loading', () => {
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})
	})

	describe('Success State', () => {
		it('renders resume components when data is loaded', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.getByTestId('resume-editor')).toBeInTheDocument()
			expect(screen.getByTestId('resume-viewer')).toBeInTheDocument()
			expect(screen.queryByText('loading')).not.toBeInTheDocument()
		})

		it('passes resume data to ResumeViewer', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const resumeViewer = screen.getByTestId('resume-viewer')
			expect(resumeViewer).toHaveAttribute('data-resume-id', mockResume.id)
		})

		it('applies correct classes to resume components', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const resumeEditor = screen.getByTestId('resume-editor')
			expect(resumeEditor).toHaveClass('size-full', 'bg-neutral-50', 'p-12')

			const resumeViewer = screen.getByTestId('resume-viewer')
			expect(resumeViewer).toHaveClass('max-h-screen')
		})

		it('creates resume ref for ResumeViewer', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			// The dynamic component is already mocked above
			render(<ResumeView />)

			// Check that resume viewer is rendered (ref is handled internally)
			expect(screen.getByTestId('resume-viewer')).toBeInTheDocument()
		})
	})

	describe('Layout Structure', () => {
		it('renders with correct main container structure', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const mainContainer = screen.getByRole('main')
			expect(mainContainer).toHaveClass('flex', 'h-screen')
		})

		it('renders ResumeViewer in a shadowed container', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const viewerContainer = screen.getByTestId('resume-viewer').parentElement
			expect(viewerContainer).toHaveClass('shadow-2xl', 'bg-neutral-50', 'size-a4', 'max-h-screen', 'relative')
		})

		it('renders components in correct order', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const container = screen.getByRole('main')
			const children = Array.from(container.children)

			// First child should contain the ResumeViewer
			expect(children[0]).toContainElement(screen.getByTestId('resume-viewer'))
			// Second child should be the ResumeEditor
			expect(children[1]).toBe(screen.getByTestId('resume-editor'))
		})
	})

	describe('Dynamic Import', () => {
		it('renders ResumeViewer as dynamic import with SSR disabled', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const dynamicComponent = screen.getByTestId('resume-viewer')
			expect(dynamicComponent).toHaveAttribute('data-ssr', 'false')
		})
	})

	describe('Error Handling', () => {
		it('handles undefined resume data gracefully', () => {
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})

		it('handles null resume data gracefully', () => {
			mockUseBaseResume.mockReturnValue({
				data: null,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})

		it('handles query errors gracefully', () => {
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: true,
				error: new Error('Network error'),
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.getByText('loading')).toBeInTheDocument()
			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('renders with proper main landmark', () => {
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			expect(screen.getByRole('main')).toBeInTheDocument()
		})

		it('provides semantic structure when resume is loaded', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			render(<ResumeView />)

			const main = screen.getByRole('main')
			expect(main).toBeInTheDocument()
			expect(main).toContainElement(screen.getByTestId('resume-editor'))
			expect(main).toContainElement(screen.getByTestId('resume-viewer'))
		})
	})

	describe('State Transitions', () => {
		it('transitions from loading to success state', async () => {
			// Start with loading state
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			const {rerender} = render(<ResumeView />)

			expect(screen.getByText('loading')).toBeInTheDocument()

			// Transition to success state
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			rerender(<ResumeView />)

			expect(screen.queryByText('loading')).not.toBeInTheDocument()
			expect(screen.getByTestId('resume-editor')).toBeInTheDocument()
			expect(screen.getByTestId('resume-viewer')).toBeInTheDocument()
		})

		it('transitions from loading to error state', async () => {
			// Start with loading state
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: true,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			const {rerender} = render(<ResumeView />)

			expect(screen.getByText('loading')).toBeInTheDocument()

			// Transition to error state
			mockUseBaseResume.mockReturnValue({
				data: undefined,
				isLoading: false,
				isError: true,
				error: new Error('Failed to load'),
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			rerender(<ResumeView />)

			expect(screen.getByText('loading')).toBeInTheDocument()
			expect(screen.queryByTestId('resume-editor')).not.toBeInTheDocument()
			expect(screen.queryByTestId('resume-viewer')).not.toBeInTheDocument()
		})
	})

	describe('Component Unmounting', () => {
		it('unmounts without errors', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			const {unmount} = render(<ResumeView />)

			expect(() => unmount()).not.toThrow()
		})

		it('cleans up resume ref on unmount', () => {
			const mockResume = createMockResumeData()
			mockUseBaseResume.mockReturnValue({
				data: mockResume,
				isLoading: false,
				isError: false,
				error: null,
				refetch: vi.fn(),
				isRefetching: false
			} as any)

			const {unmount} = render(<ResumeView />)

			// Should not throw when cleaning up
			expect(() => unmount()).not.toThrow()
		})
	})
})
