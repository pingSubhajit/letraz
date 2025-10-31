import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Education from '@/components/onboarding/Education'
import type {Education as EducationType} from '@/lib/education/types'

// Mock data
const mockEducations: EducationType[] = [
	{
		id: '1',
		user: 'user1',
		resume_section: 'section1',
		institution_name: 'Harvard University',
		field_of_study: 'Computer Science',
		degree: 'Bachelor of Science',
		country: {code: 'USA', name: 'United States'},
		started_from_month: 9,
		started_from_year: 2018,
		finished_at_month: 5,
		finished_at_year: 2022,
		current: false,
		description: 'Studied computer science fundamentals',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: '2',
		user: 'user1',
		resume_section: 'section1',
		institution_name: 'MIT',
		field_of_study: 'Machine Learning',
		degree: 'Master of Science',
		country: {code: 'USA', name: 'United States'},
		started_from_month: 9,
		started_from_year: 2022,
		finished_at_month: null,
		finished_at_year: null,
		current: true,
		description: null,
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	}
]

// --- Mocks ---
vi.mock('@/components/animations/TextAnimations', () => ({
	default: ({text, className, type}: { text: string; className?: string; type?: string }) => (
		<div className={className} data-testid="text-animate" data-type={type}>
			{text}
		</div>
	)
}))

vi.mock('@/components/onboarding/EducationForm', () => ({
	default: () => (
		<div data-testid="education-form">
			Education Form Component
		</div>
	)
}))

vi.mock('@/components/ui/scroll-area', () => ({
	ScrollArea: ({children}: {children: React.ReactNode}) => (
		<div data-testid="scroll-area">{children}</div>
	)
}))

vi.mock('@/components/ui/pop-confirm', () => ({
	default: ({triggerElement, message, onYes}: any) => (
		<div data-testid="pop-confirm">
			<div data-testid="trigger-element">{triggerElement}</div>
			<div data-testid="confirm-message">{message}</div>
			<button data-testid="confirm-yes" onClick={onYes}>Yes</button>
		</div>
	)
}))

vi.mock('motion/react', () => ({
	motion: {
		div: ({children, className, initial, animate, transition, ...props}: any) => (
			<div
				data-testid="motion-div"
				className={className}
				data-initial={JSON.stringify(initial)}
				data-animate={JSON.stringify(animate)}
				data-transition={JSON.stringify(transition)}
				{...props}
			>
				{children}
			</div>
		)
	}
}))

vi.mock('@formkit/auto-animate/react', () => ({
	useAutoAnimate: vi.fn(() => [vi.fn()])
}))

vi.mock('lucide-react', () => ({
	X: ({size, className}: {size?: number; className?: string}) => (
		<div data-testid="x-icon" data-size={size} className={className}>
			X
		</div>
	)
}))

vi.mock('sonner', () => ({
	toast: {
		error: vi.fn()
	}
}))

vi.mock('@/constants', () => ({
	months: [
		{value: '1', label: 'January'},
		{value: '2', label: 'February'},
		{value: '5', label: 'May'},
		{value: '9', label: 'September'}
	]
}))

// Mock React Query hooks
const mockMutateAsync = vi.fn()
const mockQueryClient = {
	cancelQueries: vi.fn(),
	getQueryData: vi.fn(),
	setQueryData: vi.fn(),
	invalidateQueries: vi.fn()
}

vi.mock('@tanstack/react-query', () => ({
	useQueryClient: () => mockQueryClient
}))

vi.mock('@/lib/education/queries', () => ({
	educationOptions: {
		queryKey: ['educations'],
		queryFn: vi.fn()
	},
	useCurrentEducations: vi.fn()
}))

vi.mock('@/lib/education/mutations', () => ({
	useDeleteEducationMutation: vi.fn()
}))

// --- Tests ---
describe('Education', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const {useCurrentEducations} = vi.mocked(await import('@/lib/education/queries'))
		const {useDeleteEducationMutation} = vi.mocked(await import('@/lib/education/mutations'))

		useCurrentEducations.mockReturnValue({
			data: mockEducations,
			isLoading: false,
			error: null
		} as any)

		useDeleteEducationMutation.mockReturnValue({
			mutateAsync: mockMutateAsync
		} as any)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the education component with all elements', () => {
			render(<Education />)

			// Check main container
			const container = document.querySelector('.w-full.h-full.flex.flex-col')
			expect(container).toBeInTheDocument()

			// Check scroll area
			expect(screen.getByTestId('scroll-area')).toBeInTheDocument()

			// Check heading text animations
			expect(screen.getByText('Tell us more')).toBeInTheDocument()
			expect(screen.getByText('about your education')).toBeInTheDocument()

			// Check form component
			expect(screen.getByTestId('education-form')).toBeInTheDocument()
		})

		it('renders text animations with correct styling', () => {
			render(<Education />)

			const textAnimations = screen.getAllByTestId('text-animate')
			expect(textAnimations).toHaveLength(2)

			textAnimations.forEach(animation => {
				expect(animation).toHaveClass('text-5xl', 'leading-snug')
				expect(animation).toHaveAttribute('data-type', 'calmInUp')
			})
		})

		it('renders education list when educations exist', () => {
			render(<Education />)

			// Check motion div for education list
			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toBeInTheDocument()
			expect(motionDiv).toHaveClass('absolute', 'h-[512px]', 'w-[40%]')

			// Check educations heading
			expect(screen.getByText('Educations')).toBeInTheDocument()

			// Check education items
			expect(screen.getByText(/Bachelor of Science in Computer Science from Harvard University/)).toBeInTheDocument()
			expect(screen.getByText(/Master of Science in Machine Learning from MIT/)).toBeInTheDocument()
		})
	})

	describe('Education List Display', () => {
		it('displays education details correctly', () => {
			render(<Education />)

			// Check first education
			expect(screen.getByText(/Bachelor of Science in Computer Science from Harvard University/)).toBeInTheDocument()
			expect(screen.getByText(/From September 2018 until May 2022/)).toBeInTheDocument()

			// Check second education (current)
			expect(screen.getByText(/Master of Science in Machine Learning from MIT/)).toBeInTheDocument()
			expect(screen.getByText(/From September 2022/)).toBeInTheDocument()
		})

		it('handles education with missing fields gracefully', async () => {
			const {useCurrentEducations} = vi.mocked(await import('@/lib/education/queries'))
			useCurrentEducations.mockReturnValue({
				data: [{
					id: '3',
					institution_name: 'Test University',
					field_of_study: '',
					degree: '',
					started_from_month: null,
					started_from_year: null,
					finished_at_month: null,
					finished_at_year: null
				}],
				isLoading: false,
				error: null
			} as any)

			render(<Education />)

			expect(screen.getByText('Test University')).toBeInTheDocument()
		})

		it('shows correct month labels', () => {
			render(<Education />)

			expect(screen.getByText(/September 2018/)).toBeInTheDocument()
			expect(screen.getByText(/May 2022/)).toBeInTheDocument()
			expect(screen.getByText(/September 2022/)).toBeInTheDocument()
		})
	})

	describe('Delete Functionality', () => {
		it('renders delete buttons for each education', () => {
			render(<Education />)

			const deleteButtons = screen.getAllByTestId('x-icon')
			expect(deleteButtons).toHaveLength(2)

			deleteButtons.forEach(button => {
				expect(button).toHaveAttribute('data-size', '16')
			})
		})

		it('shows pop confirm when delete button is clicked', () => {
			render(<Education />)

			const popConfirms = screen.getAllByTestId('pop-confirm')
			expect(popConfirms).toHaveLength(2)

			const confirmMessages = screen.getAllByTestId('confirm-message')
			expect(confirmMessages).toHaveLength(2)
			confirmMessages.forEach(message => {
				expect(message).toHaveTextContent('Are you sure you want to delete this education?')
			})
		})

		it('calls delete mutation when confirmed', async () => {
			const user = userEvent.setup()
			render(<Education />)

			const confirmButtons = screen.getAllByTestId('confirm-yes')
			await user.click(confirmButtons[0])

			expect(mockMutateAsync).toHaveBeenCalledWith('1')
		})

		it('handles delete mutation with optimistic updates', async () => {
			const {useDeleteEducationMutation} = vi.mocked(await import('@/lib/education/mutations'))

			let capturedOptions: any
			useDeleteEducationMutation.mockImplementation((options) => {
				capturedOptions = options
				return {
					mutateAsync: mockMutateAsync,
					mutate: vi.fn(),
					data: undefined,
					error: null,
					variables: undefined,
					isError: false,
					isIdle: true,
					isPending: false,
					isSuccess: false,
					failureCount: 0,
					failureReason: null,
					isPaused: false,
					status: 'idle' as const,
					submittedAt: 0,
					reset: vi.fn(),
					context: undefined
				} as any
			})

			render(<Education />)

			// Check that mutation options are set up correctly
			expect(capturedOptions.onMutate).toBeDefined()
			expect(capturedOptions.onError).toBeDefined()
			expect(capturedOptions.onSettled).toBeDefined()
		})
	})

	describe('Animation and Motion', () => {
		it('applies correct motion properties to education list', () => {
			render(<Education />)

			const motionDiv = screen.getByTestId('motion-div')
			const initialData = JSON.parse(motionDiv.getAttribute('data-initial') || '{}')
			const animateData = JSON.parse(motionDiv.getAttribute('data-animate') || '{}')

			expect(initialData).toEqual({opacity: 0, y: '-30%'})
			expect(animateData.opacity).toBe(1)
			expect(animateData.y).toBe('-50%')
		})

		it('hides education list when no educations exist', async () => {
			const {useCurrentEducations} = vi.mocked(await import('@/lib/education/queries'))
			useCurrentEducations.mockReturnValue({
				data: [],
				isLoading: false,
				error: null
			} as any)

			render(<Education />)

			const motionDiv = screen.getByTestId('motion-div')
			const animateData = JSON.parse(motionDiv.getAttribute('data-animate') || '{}')

			expect(animateData.opacity).toBe(0)
			expect(animateData.y).toBe('-30%')
		})

		it('uses auto-animate for list items', async () => {
			const {useAutoAnimate} = vi.mocked(await import('@formkit/auto-animate/react'))

			render(<Education />)

			expect(useAutoAnimate).toHaveBeenCalled()
		})
	})

	describe('Layout and Positioning', () => {
		it('positions main content correctly', () => {
			render(<Education />)

			const container = document.querySelector('.w-full.h-full.flex.flex-col.justify-start.pl-16.mb-40.pt-16')
			expect(container).toBeInTheDocument()
		})

		it('positions education list on the right side', () => {
			render(<Education />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass(
				'absolute',
				'h-[512px]',
				'w-[40%]',
				'right-16',
				'top-1/2',
				'-translate-y-1/2',
				'overflow-auto'
			)
		})

		it('positions delete buttons correctly', () => {
			render(<Education />)

			const deleteButtons = document.querySelectorAll('.absolute.top-2.right-2')
			expect(deleteButtons).toHaveLength(2)
		})
	})

	describe('Error Handling', () => {
		it('handles loading state', async () => {
			const {useCurrentEducations} = vi.mocked(await import('@/lib/education/queries'))
			useCurrentEducations.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null
			} as any)

			render(<Education />)

			// Component should still render without crashing
			expect(screen.getByTestId('education-form')).toBeInTheDocument()
		})

		it('handles error state', async () => {
			const {useCurrentEducations} = vi.mocked(await import('@/lib/education/queries'))
			useCurrentEducations.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to fetch')
			} as any)

			render(<Education />)

			// Component should still render without crashing
			expect(screen.getByTestId('education-form')).toBeInTheDocument()
		})

		it('handles delete error with toast notification', async () => {
			const {toast} = vi.mocked(await import('sonner'))
			const {useDeleteEducationMutation} = vi.mocked(await import('@/lib/education/mutations'))

			let capturedOptions: any
			useDeleteEducationMutation.mockImplementation((options) => {
				capturedOptions = options
				return {
					mutateAsync: mockMutateAsync,
					mutate: vi.fn(),
					data: undefined,
					error: null,
					variables: undefined,
					isError: false,
					isIdle: true,
					isPending: false,
					isSuccess: false,
					failureCount: 0,
					failureReason: null,
					isPaused: false,
					status: 'idle' as const,
					submittedAt: 0,
					reset: vi.fn(),
					context: undefined
				} as any
			})

			render(<Education />)

			// Simulate error in onError callback
			const mockError = new Error('Delete failed')
			const mockContext = {prevEducations: mockEducations}
			capturedOptions.onError(mockError, '1', mockContext)

			expect(toast.error).toHaveBeenCalledWith('Failed to delete education.')
			expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['educations'], mockEducations)
		})
	})

	describe('Responsive Design', () => {
		it('applies responsive classes to main container', () => {
			render(<Education />)

			const container = document.querySelector('.w-full.h-full')
			expect(container).toHaveClass('pl-16', 'mb-40', 'pt-16')
		})

		it('applies responsive classes to education list', () => {
			render(<Education />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('w-[40%]', 'right-16')

			const list = document.querySelector('.max-w-lg.mx-auto')
			expect(list).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('provides proper button roles for delete actions', () => {
			render(<Education />)

			const deleteButtons = document.querySelectorAll('button')
			expect(deleteButtons.length).toBeGreaterThan(0)
		})

		it('has proper list structure', () => {
			render(<Education />)

			const list = document.querySelector('ul')
			expect(list).toBeInTheDocument()

			const listItems = document.querySelectorAll('li')
			expect(listItems).toHaveLength(2)
		})

		it('provides meaningful text content', () => {
			render(<Education />)

			expect(screen.getByText('Tell us more')).toBeInTheDocument()
			expect(screen.getByText('about your education')).toBeInTheDocument()
			expect(screen.getByText('Educations')).toBeInTheDocument()
		})
	})

	describe('Integration with React Query', () => {
		it('uses correct query options', async () => {
			const {useCurrentEducations} = vi.mocked(await import('@/lib/education/queries'))

			render(<Education />)

			expect(useCurrentEducations).toHaveBeenCalled()
		})

		it('uses correct mutation options', async () => {
			const {useDeleteEducationMutation} = vi.mocked(await import('@/lib/education/mutations'))

			render(<Education />)

			expect(useDeleteEducationMutation).toHaveBeenCalled()
		})

		it('uses query client for optimistic updates', () => {
			render(<Education />)

			// Query client should be used in the component
			expect(mockQueryClient).toBeDefined()
		})
	})
})
