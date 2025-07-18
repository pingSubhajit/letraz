import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {useCompletion} from 'ai/react'
import {JobSummary, JobSummaryFromJson} from '@/components/JobSummary'
import {createMockJob} from '@/__tests__/helpers'

// Mock external dependencies
vi.mock('ai/react', () => ({
	useCompletion: vi.fn()
}))

// Helper function to create a complete mock UseCompletion return value
const createMockUseCompletion = (overrides?: any) => ({
	completion: '',
	isLoading: false,
	handleSubmit: vi.fn(),
	complete: vi.fn(),
	error: null,
	stop: vi.fn(),
	setCompletion: vi.fn(),
	input: '',
	setInput: vi.fn(),
	data: undefined,
	...overrides
})

vi.mock('@/components/utilities/AiLoading', () => ({
	__esModule: true,
	default: ({loading, text}: { loading: boolean; text: string }) => (
		loading ? <div data-testid="ai-loading">{text}</div> : null
	)
}))

describe('JobSummary Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders job details when not loading', () => {
			const jobDetails = '<h1>Software Engineer</h1><p>Join our team as a Software Engineer.</p>'

			render(<JobSummary jobDetails={jobDetails} loading={false} />)

			expect(screen.getByRole('heading', {name: 'Software Engineer'})).toBeInTheDocument()
			expect(screen.getByText('Join our team as a Software Engineer.')).toBeInTheDocument()
		})

		it('renders loading state when loading is true', () => {
			render(<JobSummary jobDetails="<h1>Test</h1>" loading={true} />)

			expect(screen.getByTestId('ai-loading')).toBeInTheDocument()
			expect(screen.getByText('Understanding the job requirements')).toBeInTheDocument()
		})


		it('applies view transition name', () => {
			render(<JobSummary jobDetails="<h1>Test</h1>" />)

			const container = screen.getByRole('heading', {name: 'Test'}).closest('div')?.parentElement
			expect(container).toHaveStyle('view-transition-name: craft_container')
		})
	})

	describe('Content Rendering', () => {
		it('renders HTML content using dangerouslySetInnerHTML', () => {
			const htmlContent = '<h1>Job Title</h1><p>Job description with <strong>important</strong> details.</p>'

			render(<JobSummary jobDetails={htmlContent} loading={false} />)

			expect(screen.getByRole('heading', {name: 'Job Title'})).toBeInTheDocument()
			expect(screen.getByText((content, element) => {
				return element?.tagName.toLowerCase() === 'p' && content.includes('Job description with')
			})).toBeInTheDocument()
			expect(screen.getByText('important')).toBeInTheDocument()
		})

		it('handles empty job details', () => {
			const {container} = render(<JobSummary jobDetails="" loading={false} />)

			const outerDiv = container.firstChild
			expect(outerDiv).toBeInTheDocument()
		})

		it('handles complex HTML structures', () => {
			const complexHTML = `
        <div>
          <h2>Position: Senior Developer</h2>
          <ul>
            <li>React experience required</li>
            <li>TypeScript knowledge</li>
          </ul>
          <p>Salary: <span>$100,000</span></p>
        </div>
      `

			render(<JobSummary jobDetails={complexHTML} loading={false} />)

			expect(screen.getByRole('heading', {name: 'Position: Senior Developer'})).toBeInTheDocument()
			expect(screen.getByText('React experience required')).toBeInTheDocument()
			expect(screen.getByText('TypeScript knowledge')).toBeInTheDocument()
			expect(screen.getByText('$100,000')).toBeInTheDocument()
		})
	})

	describe('Loading States', () => {
		it('shows loading component when loading prop is true', () => {
			render(<JobSummary jobDetails="<h1>Test</h1>" loading={true} />)

			expect(screen.getByTestId('ai-loading')).toBeInTheDocument()
			expect(screen.queryByRole('heading', {name: 'Test'})).not.toBeInTheDocument()
		})

		it('hides loading component when loading prop is false', () => {
			render(<JobSummary jobDetails="<h1>Test</h1>" loading={false} />)

			expect(screen.queryByTestId('ai-loading')).not.toBeInTheDocument()
			expect(screen.getByRole('heading', {name: 'Test'})).toBeInTheDocument()
		})

		it('defaults to not loading when loading prop is undefined', () => {
			render(<JobSummary jobDetails="<h1>Test</h1>" />)

			expect(screen.queryByTestId('ai-loading')).not.toBeInTheDocument()
			expect(screen.getByRole('heading', {name: 'Test'})).toBeInTheDocument()
		})

		it('handles loading state transitions', () => {
			const {rerender} = render(<JobSummary jobDetails="<h1>Test</h1>" loading={true} />)

			expect(screen.getByTestId('ai-loading')).toBeInTheDocument()

			rerender(<JobSummary jobDetails="<h1>Test</h1>" loading={false} />)

			expect(screen.queryByTestId('ai-loading')).not.toBeInTheDocument()
			expect(screen.getByRole('heading', {name: 'Test'})).toBeInTheDocument()
		})
	})


	describe('Edge Cases', () => {
		it('handles malformed HTML gracefully', () => {
			const malformedHTML = '<h1>Unclosed heading<p>Paragraph without closing<div>Mixed tags'

			render(<JobSummary jobDetails={malformedHTML} loading={false} />)

			expect(screen.getByText('Unclosed heading')).toBeInTheDocument()
			expect(screen.getByText('Paragraph without closing')).toBeInTheDocument()
			expect(screen.getByText('Mixed tags')).toBeInTheDocument()
		})

		it('handles HTML with script tags safely', () => {
			const htmlWithScript = '<p>Safe content</p><script>alert("xss")</script>'

			render(<JobSummary jobDetails={htmlWithScript} loading={false} />)

			expect(screen.getByText('Safe content')).toBeInTheDocument()
			// Script tags are handled by the browser and won't be visible as text
			expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument()
		})

		it('handles very long job details', () => {
			const longContent = '<p>' + 'Very long job description. '.repeat(100) + '</p>'

			render(<JobSummary jobDetails={longContent} loading={false} />)

			expect(screen.getByText(/Very long job description/)).toBeInTheDocument()
		})
	})
})

describe('JobSummaryFromJson Component', () => {
	const mockUseCompletion = vi.mocked(useCompletion)

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders with job details and initializes completion', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '<h1>Software Engineer at Test Company</h1><p>Great opportunity!</p>'
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByRole('heading', {name: 'Software Engineer at Test Company'})).toBeInTheDocument()
			expect(screen.getByText('Great opportunity!')).toBeInTheDocument()
		})

		it('shows loading state initially', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: true
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByTestId('ai-loading')).toBeInTheDocument()
			expect(screen.getByText('Understanding the job requirements')).toBeInTheDocument()
		})

		it('calls handleSubmit on mount', () => {
			const mockJob = createMockJob()

			const mockHandleSubmit = vi.fn()
			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: false,
				handleSubmit: mockHandleSubmit
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(mockHandleSubmit).toHaveBeenCalled()
		})
	})

	describe('useCompletion Integration', () => {
		it('configures useCompletion with correct API endpoint', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: false
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(mockUseCompletion).toHaveBeenCalledWith({
				api: '/app/craft/summarize',
				initialInput: JSON.stringify(mockJob)
			})
		})

		it('passes job details as JSON string to initialInput', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: false
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(mockUseCompletion).toHaveBeenCalledWith({
				api: '/app/craft/summarize',
				initialInput: JSON.stringify(mockJob)
			})
		})

		it('handles completion state changes', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: 'Initial completion',
				isLoading: false
			}))

			const {rerender} = render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByText('Initial completion')).toBeInTheDocument()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: 'Updated completion',
				isLoading: false
			}))

			rerender(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByText('Updated completion')).toBeInTheDocument()
		})

		it('handles loading state transitions', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: true
			}))

			const {rerender} = render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByTestId('ai-loading')).toBeInTheDocument()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '<h1>Completed summary</h1>',
				isLoading: false
			}))

			rerender(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.queryByTestId('ai-loading')).not.toBeInTheDocument()
			expect(screen.getByRole('heading', {name: 'Completed summary'})).toBeInTheDocument()
		})
	})

	describe('Error Handling', () => {
		it('handles useCompletion errors gracefully', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: false,
				error: new Error('API Error')
			}))

			expect(() => render(<JobSummaryFromJson jobDetails={mockJob} />)).not.toThrow()
		})

		it('handles empty job details', () => {
			const emptyJob = createMockJob({
				title: '',
				company_name: '',
				description: '',
				requirements: [],
				location: '',
				job_url: '',
				currency: '',
				salary_min: null,
				salary_max: null,
				responsibilities: [],
				benefits: []
			})

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: false
			}))

			render(<JobSummaryFromJson jobDetails={emptyJob} />)

			expect(mockUseCompletion).toHaveBeenCalledWith({
				api: '/app/craft/summarize',
				initialInput: JSON.stringify(emptyJob)
			})
		})
	})

	describe('Integration with JobSummary', () => {
		it('passes completion and loading state to JobSummary', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '<h1>Generated Summary</h1>',
				isLoading: false
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByRole('heading', {name: 'Generated Summary'})).toBeInTheDocument()
		})

		it('shows loading state in JobSummary when completion is loading', () => {
			const mockJob = createMockJob()

			mockUseCompletion.mockReturnValue(createMockUseCompletion({
				completion: '',
				isLoading: true
			}))

			render(<JobSummaryFromJson jobDetails={mockJob} />)

			expect(screen.getByTestId('ai-loading')).toBeInTheDocument()
		})
	})
})
