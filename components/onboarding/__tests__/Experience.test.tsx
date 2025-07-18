import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Experience from '@/components/onboarding/Experience'
import type {Experience as ExperienceType} from '@/lib/experience/types'

// Mock data
const mockExperiences: ExperienceType[] = [
	{
		id: '1',
		user: 'user1',
		resume_section: 'section1',
		company_name: 'Google',
		job_title: 'Software Engineer',
		country: {code: 'USA', name: 'United States'},
		city: 'Mountain View',
		employment_type: 'flt',
		started_from_month: 6,
		started_from_year: 2020,
		finished_at_month: 8,
		finished_at_year: 2022,
		current: false,
		description: 'Worked on search algorithms',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	},
	{
		id: '2',
		user: 'user1',
		resume_section: 'section1',
		company_name: 'Microsoft',
		job_title: 'Senior Software Engineer',
		country: {code: 'USA', name: 'United States'},
		city: 'Seattle',
		employment_type: 'flt',
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

vi.mock('@/components/onboarding/ExperienceForm', () => ({
	default: () => (
		<div data-testid="experience-form">
			Experience Form Component
		</div>
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
		{value: '6', label: 'June'},
		{value: '8', label: 'August'},
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

vi.mock('@/lib/experience/queries', () => ({
	experienceQueryOptions: {
		queryKey: ['experiences'],
		queryFn: vi.fn()
	},
	useCurrentExperiences: vi.fn()
}))

vi.mock('@/lib/experience/mutations', () => ({
	useDeleteExperienceMutation: vi.fn()
}))

// Mock unused actions import
vi.mock('@/lib/experience/actions', () => ({
	deleteExperienceFromDB: vi.fn()
}))

// --- Tests ---
describe('Experience', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Setup default mock implementations
		const {useCurrentExperiences} = vi.mocked(await import('@/lib/experience/queries'))
		const {useDeleteExperienceMutation} = vi.mocked(await import('@/lib/experience/mutations'))

		useCurrentExperiences.mockReturnValue({
			data: mockExperiences,
			isLoading: false,
			error: null
		} as any)

		useDeleteExperienceMutation.mockReturnValue({
			mutateAsync: mockMutateAsync
		} as any)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Component Rendering', () => {
		it('renders the experience component with all elements', () => {
			render(<Experience />)

			// Check main container
			const container = document.querySelector('.w-full.h-full.flex.flex-col')
			expect(container).toBeInTheDocument()

			// Check heading text animations
			expect(screen.getByText('What about')).toBeInTheDocument()
			expect(screen.getByText('your past experiences')).toBeInTheDocument()

			// Check form component
			expect(screen.getByTestId('experience-form')).toBeInTheDocument()
		})

		it('renders text animations with correct styling', () => {
			render(<Experience />)

			const textAnimations = screen.getAllByTestId('text-animate')
			expect(textAnimations).toHaveLength(2)

			textAnimations.forEach(animation => {
				expect(animation).toHaveClass('text-5xl', 'leading-snug')
				expect(animation).toHaveAttribute('data-type', 'calmInUp')
			})
		})

		it('renders experience list when experiences exist', () => {
			render(<Experience />)

			// Check motion div for experience list
			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toBeInTheDocument()
			expect(motionDiv).toHaveClass('absolute', 'h-[512px]', 'w-[40%]')

			// Check experiences heading
			expect(screen.getByText('Experiences')).toBeInTheDocument()

			// Check experience items
			expect(screen.getByText(/Software Engineer in Google/)).toBeInTheDocument()
			expect(screen.getByText(/Senior Software Engineer in Microsoft/)).toBeInTheDocument()
		})
	})

	describe('Experience List Display', () => {
		it('displays experience details correctly', () => {
			render(<Experience />)

			// Check first experience
			expect(screen.getByText(/Software Engineer in Google/)).toBeInTheDocument()
			expect(screen.getByText(/From June 2020 until August 2022/)).toBeInTheDocument()

			// Check second experience (current)
			expect(screen.getByText(/Senior Software Engineer in Microsoft/)).toBeInTheDocument()
			expect(screen.getByText(/From September 2022/)).toBeInTheDocument()
		})

		it('handles experience with missing job title gracefully', async () => {
			const {useCurrentExperiences} = vi.mocked(await import('@/lib/experience/queries'))
			useCurrentExperiences.mockReturnValue({
				data: [{
					id: '3',
					company_name: 'Test Company',
					job_title: '',
					started_from_month: null,
					started_from_year: null,
					finished_at_month: null,
					finished_at_year: null
				}],
				isLoading: false,
				error: null
			} as any)

			render(<Experience />)

			expect(screen.getByText('Test Company')).toBeInTheDocument()
		})

		it('shows correct month labels', () => {
			render(<Experience />)

			expect(screen.getByText(/June 2020/)).toBeInTheDocument()
			expect(screen.getByText(/August 2022/)).toBeInTheDocument()
			expect(screen.getByText(/September 2022/)).toBeInTheDocument()
		})
	})

	describe('Delete Functionality', () => {
		it('renders delete buttons for each experience', () => {
			render(<Experience />)

			const deleteButtons = screen.getAllByTestId('x-icon')
			expect(deleteButtons).toHaveLength(2)

			deleteButtons.forEach(button => {
				expect(button).toHaveAttribute('data-size', '16')
			})
		})

		it('shows pop confirm when delete button is clicked', () => {
			render(<Experience />)

			const popConfirms = screen.getAllByTestId('pop-confirm')
			expect(popConfirms).toHaveLength(2)

			const confirmMessages = screen.getAllByTestId('confirm-message')
			expect(confirmMessages).toHaveLength(2)
			confirmMessages.forEach(message => {
				expect(message).toHaveTextContent('Are you sure you want to delete this experience?')
			})
		})

		it('calls delete mutation when confirmed', async () => {
			const user = userEvent.setup()
			render(<Experience />)

			const confirmButtons = screen.getAllByTestId('confirm-yes')
			await user.click(confirmButtons[0])

			expect(mockMutateAsync).toHaveBeenCalledWith('1')
		})
	})

	describe('Animation and Motion', () => {
		it('applies correct motion properties to experience list', () => {
			render(<Experience />)

			const motionDiv = screen.getByTestId('motion-div')
			const initialData = JSON.parse(motionDiv.getAttribute('data-initial') || '{}')
			const animateData = JSON.parse(motionDiv.getAttribute('data-animate') || '{}')

			expect(initialData).toEqual({opacity: 0, y: '-30%'})
			expect(animateData.opacity).toBe(1)
			expect(animateData.y).toBe('-50%')
		})

		it('hides experience list when no experiences exist', async () => {
			const {useCurrentExperiences} = vi.mocked(await import('@/lib/experience/queries'))
			useCurrentExperiences.mockReturnValue({
				data: [],
				isLoading: false,
				error: null
			} as any)

			render(<Experience />)

			const motionDiv = screen.getByTestId('motion-div')
			const animateData = JSON.parse(motionDiv.getAttribute('data-animate') || '{}')

			expect(animateData.opacity).toBe(0)
			expect(animateData.y).toBe('-30%')
		})
	})

	describe('Error Handling', () => {
		it('handles loading state', async () => {
			const {useCurrentExperiences} = vi.mocked(await import('@/lib/experience/queries'))
			useCurrentExperiences.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null
			} as any)

			render(<Experience />)

			// Component should still render without crashing
			expect(screen.getByTestId('experience-form')).toBeInTheDocument()
		})

		it('handles error state', async () => {
			const {useCurrentExperiences} = vi.mocked(await import('@/lib/experience/queries'))
			useCurrentExperiences.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to fetch')
			} as any)

			render(<Experience />)

			// Component should still render without crashing
			expect(screen.getByTestId('experience-form')).toBeInTheDocument()
		})
	})

	describe('Layout and Positioning', () => {
		it('positions main content correctly', () => {
			render(<Experience />)

			const container = document.querySelector('.w-full.h-full.flex.flex-col.justify-start.pl-16.mb-40.pt-16')
			expect(container).toBeInTheDocument()
		})

		it('positions experience list on the right side', () => {
			render(<Experience />)

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
	})

	describe('Accessibility', () => {
		it('provides proper button roles for delete actions', () => {
			render(<Experience />)

			const deleteButtons = document.querySelectorAll('button')
			expect(deleteButtons.length).toBeGreaterThan(0)
		})

		it('has proper list structure', () => {
			render(<Experience />)

			const list = document.querySelector('ul')
			expect(list).toBeInTheDocument()

			const listItems = document.querySelectorAll('li')
			expect(listItems).toHaveLength(2)
		})

		it('provides meaningful text content', () => {
			render(<Experience />)

			expect(screen.getByText('What about')).toBeInTheDocument()
			expect(screen.getByText('your past experiences')).toBeInTheDocument()
			expect(screen.getByText('Experiences')).toBeInTheDocument()
		})
	})

	describe('Integration with React Query', () => {
		it('uses correct query options', async () => {
			const {useCurrentExperiences} = vi.mocked(await import('@/lib/experience/queries'))

			render(<Experience />)

			expect(useCurrentExperiences).toHaveBeenCalled()
		})

		it('uses correct mutation options', async () => {
			const {useDeleteExperienceMutation} = vi.mocked(await import('@/lib/experience/mutations'))

			render(<Experience />)

			expect(useDeleteExperienceMutation).toHaveBeenCalled()
		})
	})
})
