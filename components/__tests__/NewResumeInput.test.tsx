import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {vi} from 'vitest'
import React from 'react'
import NewResumeInput from '../NewResumeInput'
import {createMockParsedJob} from '@/__tests__/helpers'

// Mock react-hook-form with proper form state control
const mockHandleSubmit = vi.fn((onSubmit) => (e: React.FormEvent) => {
	e.preventDefault()
	onSubmit({input: 'test'})
})

const mockFormState = {
	isValid: false,
	isSubmitting: false,
	isSubmitted: false
}

const mockForm = {
	control: {},
	handleSubmit: mockHandleSubmit,
	formState: mockFormState
}

vi.mock('react-hook-form', () => ({
	useForm: vi.fn(() => mockForm)
}))

// Mock Zod
vi.mock('zod', () => ({
	z: {
		object: vi.fn(() => ({
			min: vi.fn().mockReturnThis(),
			transform: vi.fn().mockReturnThis()
		})),
		string: vi.fn(() => ({
			min: vi.fn().mockReturnThis(),
			transform: vi.fn().mockReturnThis()
		}))
	}
}))

// Mock @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: vi.fn(() => ({}))
}))

// Mock the parsing function using factory
vi.mock('@/app/app/craft/parseJD', () => ({
	parseJobFromRawJD: vi.fn()
}))

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn()
	}
}))

// Mock DOM mounted hook
vi.mock('@/hooks/useDOMMounted', () => ({
	__esModule: true,
	default: () => true
}))

// Mock UI components
vi.mock('@/components/ui/form', () => ({
	Form: ({children}: {children: React.ReactNode}) => <div data-testid="form">{children}</div>,
	FormControl: ({children}: {children: React.ReactNode}) => <div data-testid="form-control">{children}</div>,
	FormField: ({render}: {render: (props: any) => React.ReactNode}) => {
		const [value, setValue] = React.useState('')
		const handleChange = (e: any) => {
			if (typeof e === 'string') {
				setValue(e)
			} else if (e && e.target && e.target.value) {
				setValue(e.target.value)
			}
		}
		return render({field: {onChange: handleChange, value, name: 'input'}})
	},
	FormItem: ({children, className}: {children: React.ReactNode; className?: string}) => <div data-testid="form-item" className={className}>{children}</div>,
	FormLabel: ({children, className}: {children: React.ReactNode; className?: string}) => <label data-testid="form-label" className={className}>{children}</label>,
	FormMessage: ({className}: {className?: string}) => <div data-testid="form-message" className={className}></div>
}))

vi.mock('@/components/ui/button', () => ({
	Button: ({children, type, disabled, onClick, className}: any) => (
		<button
			data-testid="submit-button"
			type={type}
			disabled={disabled}
			onClick={onClick}
			className={className}
		>
			{children}
		</button>
	)
}))

vi.mock('@/components/ui/textarea', () => ({
	Textarea: ({className, placeholder, onFocus, onBlur, ...props}: any) => (
		<textarea
			data-testid="textarea"
			className={className}
			placeholder={placeholder}
			onFocus={onFocus}
			onBlur={onBlur}
			role="textbox"
			{...props}
		/>
	)
}))

// Mock other dependencies
vi.mock('@/lib/utils', () => ({
	cn: (...args: any[]) => args.filter(Boolean).join(' ')
}))

// Mock the Loader2 component
vi.mock('lucide-react', () => ({
	Loader2: ({className}: { className: string }) => (
		<div data-testid="loading-spinner" className={className}>Loading...</div>
	)
}))

// Mock createPortal
vi.mock('react-dom', () => ({
	createPortal: (element: React.ReactNode, container: Element | null) => element
}))

// Mock motion
vi.mock('motion/react', () => ({
	AnimatePresence: ({children}: {children: React.ReactNode}) => <>{children}</>,
	motion: {
		div: ({children, className, style, ...props}: any) => (
			<div className={className} style={style} {...props}>{children}</div>
		)
	}
}))

// Mock next router
vi.mock('next-view-transitions', () => ({
	useTransitionRouter: () => ({
		push: vi.fn()
	})
}))

describe('NewResumeInput Component', () => {
	beforeEach(async () => {
		vi.clearAllMocks()
		mockFormState.isValid = false
		mockFormState.isSubmitting = false
		mockFormState.isSubmitted = false

		// Reset the mocked function
		const {parseJobFromRawJD} = await import('@/app/app/craft/parseJD')
		vi.mocked(parseJobFromRawJD).mockResolvedValue(createMockParsedJob())
	})

	describe('Basic Rendering', () => {
		it('renders form correctly', () => {
			render(<NewResumeInput />)

			expect(screen.getByTestId('form')).toBeInTheDocument()
			expect(screen.getByTestId('textarea')).toBeInTheDocument()
			expect(screen.getByTestId('form-label')).toHaveTextContent('Craft new resume for a job')
			expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'Paste URL or job description')
		})


		it('initially does not show submit button', () => {
			render(<NewResumeInput />)

			expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument()
		})
	})

	describe('Form Validation', () => {
		it('shows submit button when form is valid', async () => {
			mockFormState.isValid = true

			render(<NewResumeInput />)

			expect(screen.getByTestId('submit-button')).toBeInTheDocument()
			expect(screen.getByTestId('submit-button')).toHaveTextContent('Submit')
		})

		it('button is disabled when form is invalid', () => {
			mockFormState.isValid = false

			render(<NewResumeInput />)

			expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument()
		})
	})

	describe('Form Submission', () => {
		it('calls parseJobFromRawJD on form submission', async () => {
			mockFormState.isValid = true
			const user = userEvent.setup()

			render(<NewResumeInput />)

			const submitButton = screen.getByTestId('submit-button')
			await user.click(submitButton)

			const {parseJobFromRawJD} = await import('@/app/app/craft/parseJD')
			expect(vi.mocked(parseJobFromRawJD)).toHaveBeenCalledWith('test')
		})
	})

	describe('Loading States', () => {
		it('shows loading spinner when submitting', () => {
			mockFormState.isValid = true
			mockFormState.isSubmitting = true

			render(<NewResumeInput />)

			expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
		})

		it('shows loading spinner when submitted', () => {
			mockFormState.isValid = true
			mockFormState.isSubmitted = true

			render(<NewResumeInput />)

			expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
		})

		it('button is disabled when form is invalid', () => {
			mockFormState.isValid = false

			render(<NewResumeInput />)

			const submitButton = screen.queryByTestId('submit-button')
			expect(submitButton).not.toBeInTheDocument()
		})
	})

	describe('User Interactions', () => {
		it('handles textarea input', async () => {
			const user = userEvent.setup()
			render(<NewResumeInput />)

			const textarea = screen.getByTestId('textarea')
			await user.type(textarea, 'test input')

			expect(textarea).toHaveValue('test input')
		})

		it('handles focus and blur events', async () => {
			const user = userEvent.setup()
			render(<NewResumeInput />)

			const textarea = screen.getByTestId('textarea')
			await user.click(textarea)

			expect(textarea).toHaveFocus()

			await user.click(document.body)
			expect(textarea).not.toHaveFocus()
		})
	})

	describe('Error Handling', () => {
		it('shows error toast when parsing fails', async () => {
			mockFormState.isValid = true
			const {parseJobFromRawJD} = await import('@/app/app/craft/parseJD')
			vi.mocked(parseJobFromRawJD).mockRejectedValue(new Error('Parse error'))

			const user = userEvent.setup()
			render(<NewResumeInput />)

			const submitButton = screen.getByTestId('submit-button')
			await user.click(submitButton)

			await waitFor(async () => {
				const {toast} = await import('sonner')
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Parse error')
			})
		})

		it('shows generic error when no message provided', async () => {
			mockFormState.isValid = true
			const {parseJobFromRawJD} = await import('@/app/app/craft/parseJD')
			vi.mocked(parseJobFromRawJD).mockRejectedValue(new Error())

			const user = userEvent.setup()
			render(<NewResumeInput />)

			const submitButton = screen.getByTestId('submit-button')
			await user.click(submitButton)

			await waitFor(async () => {
				const {toast} = await import('sonner')
				expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Could not understand the job')
			})
		})
	})

	describe('Accessibility', () => {
		it('provides proper form labeling', () => {
			render(<NewResumeInput />)

			const label = screen.getByTestId('form-label')
			const textarea = screen.getByTestId('textarea')

			expect(label).toHaveTextContent('Craft new resume for a job')
			expect(textarea).toHaveAttribute('placeholder', 'Paste URL or job description')
		})

		it('provides proper button attributes when visible', () => {
			mockFormState.isValid = true

			render(<NewResumeInput />)

			const submitButton = screen.getByTestId('submit-button')
			expect(submitButton).toHaveAttribute('type', 'submit')
			expect(submitButton).toHaveTextContent('Submit')
		})
	})
})
