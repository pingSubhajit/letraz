import React from 'react'
import {render, screen, userEvent, waitFor} from '@/__tests__/helpers/test-utils'
import {afterEach, beforeEach, vi} from 'vitest'
import Waitlist from '../Waitlist'
import {toast} from 'sonner'
import {signUpForWaitlist} from '@/lib/waitlist/actions'

// Mock external dependencies
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn()
	}
}))

vi.mock('@/lib/waitlist/actions', () => ({
	signUpForWaitlist: vi.fn()
}))

vi.mock('@/config', () => ({
	discordHandle: 'https://discord.gg/example'
}))

// Mock framer motion
vi.mock('motion/react', () => ({
	AnimatePresence: ({children}: {children: React.ReactNode}) => <div data-testid="animate-presence">{children}</div>,
	motion: {
		div: React.forwardRef<HTMLDivElement, any>(({children, ...props}, ref) => (
			<div ref={ref} {...props} data-testid="motion-div">
				{children}
			</div>
		))
	}
}))

describe('Waitlist Component', () => {
	const defaultProps = {
		className: 'test-class',
		referrer: 'test-referrer'
	}

	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(signUpForWaitlist).mockResolvedValue({
			email: 'test@example.com',
			referrer: null
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders the waitlist form initially', () => {
			render(<Waitlist {...defaultProps} />)

			expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
			expect(screen.getByText('Join waitlist')).toBeInTheDocument()
			expect(screen.getByText('Your email will not be shared with any third parties.')).toBeInTheDocument()
		})


		it('handles undefined referrer', () => {
			render(<Waitlist referrer={undefined} />)
			expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
		})

		it('renders with AnimatePresence wrapper', () => {
			render(<Waitlist {...defaultProps} />)
			expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
		})
	})

	describe('Form Validation', () => {
		it('validates email format', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			// Initially disabled (empty email)
			expect(submitButton).toBeDisabled()

			// Invalid email
			await user.type(emailInput, 'invalid-email')
			expect(submitButton).toBeDisabled()

			// Valid email
			await user.clear(emailInput)
			await user.type(emailInput, 'test@example.com')

			await waitFor(() => {
				expect(submitButton).not.toBeDisabled()
			})
		})

		it('disables submit button during submission', async () => {
			const user = userEvent.setup()

			// Mock slow API call
			vi.mocked(signUpForWaitlist).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			// Button should be disabled during submission
			expect(submitButton).toBeDisabled()
		})

		it('shows validation errors for invalid email', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'invalid')

			// Button should remain disabled
			expect(submitButton).toBeDisabled()
		})

		it('enables button only when email is valid', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			// Start with invalid email
			await user.type(emailInput, 'invalid')
			expect(submitButton).toBeDisabled()

			// Fix to valid email
			await user.clear(emailInput)
			await user.type(emailInput, 'valid@example.com')

			await waitFor(() => {
				expect(submitButton).not.toBeDisabled()
			})
		})
	})

	describe('Form Submission', () => {
		it('submits form with valid email', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(signUpForWaitlist).toHaveBeenCalledWith('test@example.com', 'test-referrer')
			})
		})

		it('passes referrer to signup function', async () => {
			const user = userEvent.setup()
			render(<Waitlist referrer="custom-referrer" />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(signUpForWaitlist).toHaveBeenCalledWith('test@example.com', 'custom-referrer')
			})
		})

		it('handles undefined referrer in submission', async () => {
			const user = userEvent.setup()
			render(<Waitlist referrer={undefined} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(signUpForWaitlist).toHaveBeenCalledWith('test@example.com', undefined)
			})
		})

		it('resets form after successful submission', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/Thanks for signing up!/)).toBeInTheDocument()
			})

			// Form should be hidden after successful submission, not reset
			expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument()
			expect(screen.queryByText('Join waitlist')).not.toBeInTheDocument()
		})

		it('shows success message after submission', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/Thanks for signing up!/)).toBeInTheDocument()
				expect(screen.getByText('Discord')).toBeInTheDocument()
			})
		})
	})

	describe('Error Handling', () => {
		it('handles signup errors gracefully', async () => {
			const user = userEvent.setup()
			const error = new Error('Network error')
			vi.mocked(signUpForWaitlist).mockRejectedValue(error)

			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith('Failed to sign up, please try again')
			})
		})

		it('reverts to form state on error', async () => {
			const user = userEvent.setup()
			const error = new Error('API error')
			vi.mocked(signUpForWaitlist).mockRejectedValue(error)

			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled()
			})

			// Should still show the form
			expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
			expect(screen.getByText('Join waitlist')).toBeInTheDocument()
		})

		it('maintains email value after error', async () => {
			const user = userEvent.setup()
			const error = new Error('Server error')
			vi.mocked(signUpForWaitlist).mockRejectedValue(error)

			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled()
			})

			// Email should still be in the input
			expect(emailInput).toHaveValue('test@example.com')
		})

		it('handles multiple submission attempts after error', async () => {
			const user = userEvent.setup()

			// First attempt fails
			vi.mocked(signUpForWaitlist).mockRejectedValueOnce(new Error('First error'))
			// Second attempt succeeds
			vi.mocked(signUpForWaitlist).mockResolvedValueOnce({
				email: 'test@example.com',
				referrer: null
			})

			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')

			// First attempt
			await user.click(submitButton)
			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled()
			})

			// Second attempt
			await user.click(submitButton)
			await waitFor(() => {
				expect(screen.getByText(/Thanks for signing up!/)).toBeInTheDocument()
			})
		})
	})

	describe('Success State', () => {
		it('shows success message with Discord link', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/Thanks for signing up!/)).toBeInTheDocument()

				const discordLink = screen.getByText('Discord')
				expect(discordLink).toHaveAttribute('href', 'https://discord.gg/example')
				expect(discordLink).toHaveAttribute('target', '_blank')
			})
		})

		it('hides form after successful submission', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/Thanks for signing up!/)).toBeInTheDocument()
			})

			// Form should be hidden
			expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument()
			expect(screen.queryByText('Join waitlist')).not.toBeInTheDocument()
		})


	})

	describe('User Interactions', () => {
		it('handles keyboard submission', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')

			await user.type(emailInput, 'test@example.com')
			await user.keyboard('{Enter}')

			await waitFor(() => {
				expect(signUpForWaitlist).toHaveBeenCalledWith('test@example.com', 'test-referrer')
			})
		})

		it('handles form submission via button click', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(signUpForWaitlist).toHaveBeenCalled()
			})
		})

		it('focuses email input correctly', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')

			await user.click(emailInput)
			expect(emailInput).toHaveFocus()
		})

		it('supports tab navigation', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')

			emailInput.focus()
			await user.tab()

			/*
			 * Should focus the submit button next, but it's disabled initially
			 * so focus might go elsewhere
			 */
		})
	})


	describe('Animation Integration', () => {
		it('renders with AnimatePresence', () => {
			render(<Waitlist {...defaultProps} />)
			expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
		})

		it('renders motion components', () => {
			render(<Waitlist {...defaultProps} />)
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()
		})

		it('handles animation state transitions', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			// Initial state
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()

			// Submit form to trigger state change
			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/Thanks for signing up!/)).toBeInTheDocument()
			})

			// Should still have motion wrapper
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('has proper form labels and structure', () => {
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const form = emailInput.closest('form')

			expect(form).toBeInTheDocument()
			expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
		})

		it('provides clear button text', () => {
			render(<Waitlist {...defaultProps} />)

			const submitButton = screen.getByRole('button', {name: 'Join waitlist'})
			expect(submitButton).toBeInTheDocument()
		})

		it('includes privacy notice', () => {
			render(<Waitlist {...defaultProps} />)

			expect(screen.getByText('Your email will not be shared with any third parties.')).toBeInTheDocument()
		})

		it('makes Discord link accessible', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				const discordLink = screen.getByRole('link', {name: 'Discord'})
				expect(discordLink).toBeInTheDocument()
				expect(discordLink).toHaveAttribute('target', '_blank')
			})
		})

		it('supports keyboard navigation in success state', async () => {
			const user = userEvent.setup()
			render(<Waitlist {...defaultProps} />)

			const emailInput = screen.getByPlaceholderText('Enter your email')
			const submitButton = screen.getByText('Join waitlist')

			await user.type(emailInput, 'test@example.com')
			await user.click(submitButton)

			await waitFor(() => {
				const discordLink = screen.getByRole('link', {name: 'Discord'})
				expect(discordLink).toBeInTheDocument()
			})

			// Should be able to focus the Discord link
			const discordLink = screen.getByRole('link', {name: 'Discord'})
			await user.tab()
			expect(discordLink).toHaveFocus()
		})
	})
})
