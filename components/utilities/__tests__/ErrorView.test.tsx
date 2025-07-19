import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorView from '@/components/utilities/ErrorView'

// Mock motion components
vi.mock('motion/react', () => ({
	motion: {
		div: ({children, initial, animate, transition, className, role, ...props}: any) => (
			<div
				className={className}
				role={role}
				data-testid="motion-div"
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

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({src, alt, priority, role, ...props}: any) => (
		<img
			src={src}
			alt={alt}
			data-priority={priority}
			role={role}
			data-testid="error-banner-image"
			{...props}
		/>
	)
}))

// Mock UI Button component
vi.mock('@/components/ui/button', () => ({
	Button: ({children, variant, className, onClick, ...props}: any) => (
		<button
			className={className}
			onClick={onClick}
			data-variant={variant}
			data-testid="error-button"
			{...props}
		>
			{children}
		</button>
	)
}))

// Mock utils
vi.mock('@/lib/utils', () => ({
	cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('ErrorView Component', () => {
	const mockButtonFn = vi.fn()
	const mockReload = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
		// Mock window.location.reload
		Object.defineProperty(window, 'location', {
			value: {
				reload: mockReload
			},
			writable: true
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders with default props', () => {
			render(<ErrorView />)

			expect(screen.getByTestId('motion-div')).toBeInTheDocument()
			expect(screen.getByTestId('error-banner-image')).toBeInTheDocument()
			expect(screen.getByText('An unexpected error happened')).toBeInTheDocument()
			expect(screen.getByText(/That's on us. We've taken a note of this issue/)).toBeInTheDocument()
			expect(screen.getByTestId('error-button')).toBeInTheDocument()
			expect(screen.getByText('Reload')).toBeInTheDocument()
		})

		it('renders with custom title', () => {
			render(<ErrorView title="Custom Error Title" />)

			expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
			expect(screen.queryByText('An unexpected error happened')).not.toBeInTheDocument()
		})

		it('renders with custom description', () => {
			const customDescription = 'This is a custom error description'
			render(<ErrorView description={customDescription} />)

			expect(screen.getByText(customDescription)).toBeInTheDocument()
			expect(screen.queryByText(/That's on us. We've taken a note of this issue/)).not.toBeInTheDocument()
		})

		it('renders with custom button text', () => {
			render(<ErrorView buttonText="Try Again" />)

			expect(screen.getByText('Try Again')).toBeInTheDocument()
			expect(screen.queryByText('Reload')).not.toBeInTheDocument()
		})

		it('renders with custom className', () => {
			render(<ErrorView className="custom-error-class" />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('custom-error-class')
		})

		it('renders with all custom props', () => {
			const props = {
				title: 'Custom Title',
				description: 'Custom Description',
				buttonText: 'Custom Button',
				buttonFn: mockButtonFn,
				className: 'custom-class'
			}

			render(<ErrorView {...props} />)

			expect(screen.getByText('Custom Title')).toBeInTheDocument()
			expect(screen.getByText('Custom Description')).toBeInTheDocument()
			expect(screen.getByText('Custom Button')).toBeInTheDocument()
			expect(screen.getByTestId('motion-div')).toHaveClass('custom-class')
		})
	})

	describe('Button Interactions', () => {
		it('calls default reload function when button is clicked', async () => {
			const user = userEvent.setup()
			render(<ErrorView />)

			const button = screen.getByTestId('error-button')
			await user.click(button)

			expect(mockReload).toHaveBeenCalledTimes(1)
		})

		it('calls custom button function when provided', async () => {
			const user = userEvent.setup()
			render(<ErrorView buttonFn={mockButtonFn} />)

			const button = screen.getByTestId('error-button')
			await user.click(button)

			expect(mockButtonFn).toHaveBeenCalledTimes(1)
			expect(mockReload).not.toHaveBeenCalled()
		})

		it('handles button click with fireEvent', () => {
			render(<ErrorView buttonFn={mockButtonFn} />)

			const button = screen.getByTestId('error-button')
			fireEvent.click(button)

			expect(mockButtonFn).toHaveBeenCalledTimes(1)
		})

		it('handles multiple button clicks', async () => {
			const user = userEvent.setup()
			render(<ErrorView buttonFn={mockButtonFn} />)

			const button = screen.getByTestId('error-button')
			await user.click(button)
			await user.click(button)
			await user.click(button)

			expect(mockButtonFn).toHaveBeenCalledTimes(3)
		})

		it('button has correct variant and styling', () => {
			render(<ErrorView />)

			const button = screen.getByTestId('error-button')
			expect(button).toHaveAttribute('data-variant', 'secondary')
			expect(button).toHaveClass('w-[70%]')
		})
	})

	describe('Animation Integration', () => {
		it('applies correct motion properties', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveAttribute('data-initial', '{"opacity":0}')
			expect(motionDiv).toHaveAttribute('data-animate', '{"opacity":1}')
			expect(motionDiv).toHaveAttribute('data-transition', '{"duration":1.5,"delay":0.3}')
		})

		it('has correct animation timing', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			const transition = JSON.parse(motionDiv.getAttribute('data-transition') || '{}')

			expect(transition.duration).toBe(1.5)
			expect(transition.delay).toBe(0.3)
		})

		it('starts with opacity 0 and animates to opacity 1', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			const initial = JSON.parse(motionDiv.getAttribute('data-initial') || '{}')
			const animate = JSON.parse(motionDiv.getAttribute('data-animate') || '{}')

			expect(initial.opacity).toBe(0)
			expect(animate.opacity).toBe(1)
		})
	})

	describe('Accessibility Attributes', () => {
		it('has proper ARIA role and live region', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveAttribute('role', 'alert')
			expect(motionDiv).toHaveAttribute('aria-live', 'assertive')
		})

		it('has proper heading structure', () => {
			render(<ErrorView />)

			const heading = screen.getByRole('heading', {level: 1})
			expect(heading).toBeInTheDocument()
			expect(heading).toHaveTextContent('An unexpected error happened')
		})

		it('has proper heading structure with custom title', () => {
			render(<ErrorView title="Custom Error" />)

			const heading = screen.getByRole('heading', {level: 1})
			expect(heading).toHaveTextContent('Custom Error')
		})

		it('image has presentation role', () => {
			render(<ErrorView />)

			const image = screen.getByTestId('error-banner-image')
			expect(image).toHaveAttribute('role', 'presentation')
		})

		it('image has descriptive alt text', () => {
			render(<ErrorView />)

			const image = screen.getByTestId('error-banner-image')
			expect(image).toHaveAttribute('alt', 'A visually appealing banner signifying an error has occured')
		})

		it('button is accessible via keyboard', async () => {
			const user = userEvent.setup()
			render(<ErrorView buttonFn={mockButtonFn} />)

			const button = screen.getByTestId('error-button')
			button.focus()

			expect(button).toHaveFocus()

			await user.keyboard('{Enter}')
			expect(mockButtonFn).toHaveBeenCalledTimes(1)
		})

		it('button is accessible via space key', async () => {
			const user = userEvent.setup()
			render(<ErrorView buttonFn={mockButtonFn} />)

			const button = screen.getByTestId('error-button')
			button.focus()

			await user.keyboard(' ')
			expect(mockButtonFn).toHaveBeenCalledTimes(1)
		})
	})

	describe('Screen Reader Compatibility', () => {
		it('provides proper semantic structure for screen readers', () => {
			render(<ErrorView />)

			// Alert role for immediate attention
			expect(screen.getByRole('alert')).toBeInTheDocument()

			// Heading for structure
			expect(screen.getByRole('heading', {level: 1})).toBeInTheDocument()

			// Button for interaction
			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		it('has assertive live region for immediate announcement', () => {
			render(<ErrorView />)

			const alert = screen.getByRole('alert')
			expect(alert).toHaveAttribute('aria-live', 'assertive')
		})

		it('error message is contained within alert region', () => {
			render(<ErrorView title="Test Error" description="Test Description" />)

			const alert = screen.getByRole('alert')
			expect(alert).toContainElement(screen.getByText('Test Error'))
			expect(alert).toContainElement(screen.getByText('Test Description'))
		})

		it('button has accessible name', () => {
			render(<ErrorView buttonText="Retry Action" />)

			const button = screen.getByRole('button', {name: 'Retry Action'})
			expect(button).toBeInTheDocument()
		})
	})

	describe('Image Component', () => {
		it('renders image with correct src', () => {
			render(<ErrorView />)

			const image = screen.getByTestId('error-banner-image')
			expect(image).toHaveAttribute('src')
		})

		it('image has priority loading', () => {
			render(<ErrorView />)

			const image = screen.getByTestId('error-banner-image')
			expect(image).toHaveAttribute('data-priority', 'true')
		})

		it('image is decorative with presentation role', () => {
			render(<ErrorView />)

			const image = screen.getByTestId('error-banner-image')
			expect(image).toHaveAttribute('role', 'presentation')
		})
	})

	describe('CSS Classes and Styling', () => {
		it('applies default positioning classes', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('absolute', 'top-1/2', 'left-1/2', '-translate-x-[48%]', '-translate-y-1/2')
		})

		it('applies layout classes', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('flex', 'flex-col', 'justify-center', 'items-center', 'max-w-md', 'gap-4')
		})

		it('combines custom className with default classes', () => {
			render(<ErrorView className="custom-class another-class" />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveClass('custom-class', 'another-class', 'absolute', 'flex')
		})

		it('heading has error styling', () => {
			render(<ErrorView />)

			const heading = screen.getByRole('heading')
			expect(heading).toHaveClass('mt-2', 'text-center', 'font-bold', 'text-red-600', 'text-lg')
		})

		it('description has proper styling', () => {
			render(<ErrorView />)

			const description = screen.getByText(/That's on us/)
			expect(description).toHaveClass('text-sm', 'text-center', 'px-8')
		})
	})

	describe('Edge Cases', () => {
		it('handles empty title gracefully', () => {
			render(<ErrorView title="" />)

			expect(screen.getByText('An unexpected error happened')).toBeInTheDocument()
		})

		it('handles empty description gracefully', () => {
			render(<ErrorView description="" />)

			expect(screen.getByText(/That's on us. We've taken a note of this issue/)).toBeInTheDocument()
		})

		it('handles empty button text gracefully', () => {
			render(<ErrorView buttonText="" />)

			expect(screen.getByText('Reload')).toBeInTheDocument()
		})

		it('handles undefined props gracefully', () => {
			render(<ErrorView title={undefined} description={undefined} buttonText={undefined} />)

			expect(screen.getByText('An unexpected error happened')).toBeInTheDocument()
			expect(screen.getByText(/That's on us. We've taken a note of this issue/)).toBeInTheDocument()
			expect(screen.getByText('Reload')).toBeInTheDocument()
		})

		it('handles null buttonFn gracefully', () => {
			render(<ErrorView buttonFn={null as any} />)

			const button = screen.getByTestId('error-button')
			fireEvent.click(button)

			expect(mockReload).toHaveBeenCalledTimes(1)
		})

		it('handles very long title text', () => {
			const longTitle = 'A'.repeat(200)
			render(<ErrorView title={longTitle} />)

			expect(screen.getByText(longTitle)).toBeInTheDocument()
		})

		it('handles very long description text', () => {
			const longDescription = 'B'.repeat(500)
			render(<ErrorView description={longDescription} />)

			expect(screen.getByText(longDescription)).toBeInTheDocument()
		})

		it('handles special characters in text', () => {
			const specialTitle = 'Error: <script>alert("xss")</script> & special chars'
			const specialDescription = 'Description with "quotes" & <tags> and émojis 🚨'

			render(<ErrorView title={specialTitle} description={specialDescription} />)

			expect(screen.getByText(specialTitle)).toBeInTheDocument()
			expect(screen.getByText(specialDescription)).toBeInTheDocument()
		})
	})

	describe('Error Handling', () => {
		it('handles button function being called correctly', () => {
			const customFunction = vi.fn()
			render(<ErrorView buttonFn={customFunction} />)

			const button = screen.getByTestId('error-button')
			fireEvent.click(button)

			expect(customFunction).toHaveBeenCalledTimes(1)
		})

		it('uses reload function when no custom function provided', () => {
			render(<ErrorView />)

			const button = screen.getByTestId('error-button')
			fireEvent.click(button)

			expect(mockReload).toHaveBeenCalledTimes(1)
		})
	})

	describe('Component Integration', () => {
		it('integrates properly with motion component', () => {
			render(<ErrorView />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toBeInTheDocument()

			// Should have all motion props
			expect(motionDiv).toHaveAttribute('data-initial')
			expect(motionDiv).toHaveAttribute('data-animate')
			expect(motionDiv).toHaveAttribute('data-transition')
		})

		it('integrates properly with Button component', () => {
			render(<ErrorView />)

			const button = screen.getByTestId('error-button')
			expect(button).toHaveAttribute('data-variant', 'secondary')
			expect(button).toHaveClass('w-[70%]')
		})

		it('integrates properly with Image component', () => {
			render(<ErrorView />)

			const image = screen.getByTestId('error-banner-image')
			expect(image).toHaveAttribute('data-priority', 'true')
			expect(image).toHaveAttribute('role', 'presentation')
		})
	})
})
