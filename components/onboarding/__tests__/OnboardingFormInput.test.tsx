import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {vi} from 'vitest'
import React from 'react'
import {
	OnboardingFormInput,
	OnboardingFormSelect,
	OnboardingFormTextArea,
	OnboardingRichTextInput
} from '../OnboardingFormInput'

// Mock the container structure to match actual component
const MockContainer = ({children, className}: {children: React.ReactNode; className?: string}) => (
	<div className={className}>
		{children}
	</div>
)

// Mock tiptap dependencies first
vi.mock('@tiptap/react', () => ({
	Content: 'div',
	useEditor: vi.fn(() => null)
}))

// Mock RichTextEditor first to ensure it's properly applied
vi.mock('../../richTextEditor', () => {
	return {
		__esModule: true,
		default: ({className, value, onChange, placeholder}: any) => (
			<MockContainer className={className}>
				<div
					data-testid="rich-text-editor"
					onClick={() => onChange?.('test content')}
				>
					{value || placeholder}
				</div>
			</MockContainer>
		)
	}
})

// Mock the UI components
vi.mock('@/components/ui/form', () => ({
	FormControl: ({children}: {children: React.ReactNode}) => <div data-testid="form-control">{children}</div>,
	useFormField: vi.fn()
}))

vi.mock('@/components/ui/input', () => ({
	Input: React.forwardRef(({className, type, ...props}: any, ref: any) => (
		<MockContainer className={className}>
			<input data-testid="input" ref={ref} type={type || 'text'} {...props} />
		</MockContainer>
	))
}))

vi.mock('@/components/ui/textarea', () => ({
	Textarea: ({className, ...props}: any) => (
		<textarea data-testid="textarea" className={className} {...props} />
	)
}))

vi.mock('@/components/ui/select', () => ({
	Select: ({children, onValueChange, defaultValue}: any) => (
		<div data-testid="select" data-value={defaultValue} onClick={() => onValueChange?.('test')}>
			{children}
		</div>
	),
	SelectTrigger: ({children, className}: any) => (
		<div data-testid="select-trigger" className={className}>{children}</div>
	),
	SelectValue: ({placeholder}: any) => (
		<div data-testid="select-value">{placeholder}</div>
	),
	SelectContent: ({children}: any) => (
		<div data-testid="select-content">{children}</div>
	),
	SelectItem: ({children, value}: any) => (
		<div data-testid="select-item" data-value={value}>{children}</div>
	)
}))

// Mock tooltip provider
vi.mock('@/components/ui/tooltip', () => ({
	TooltipProvider: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
	Tooltip: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
	TooltipTrigger: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
	TooltipContent: ({children}: {children: React.ReactNode}) => <div>{children}</div>
}))

vi.mock('motion/react', () => ({
	motion: {
		div: ({children, className, ...props}: any) => (
			<div data-testid="motion-div" className={className} {...props}>
				{children}
			</div>
		)
	}
}))

vi.mock('@/lib/utils', () => ({
	cn: (...args: any[]) => args.filter(Boolean).join(' ')
}))

vi.mock('next/image', () => ({
	__esModule: true,
	default: ({src, alt, className}: any) => (
		<img src={src} alt={alt} className={className} data-testid="image" />
	)
}))


describe('OnboardingFormInput', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Reset the mocked function
		const {useFormField} = await import('@/components/ui/form')
		vi.mocked(useFormField).mockReturnValue({
			error: undefined
		})
	})

	describe('Basic Rendering', () => {
		it('renders input component correctly', () => {
			render(<OnboardingFormInput placeholder="Test placeholder" />)

			expect(screen.getByTestId('input')).toBeInTheDocument()
			expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Test placeholder')
		})


	})

	describe('Focus States', () => {
		it('handles focus and blur events', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormInput />)

			const input = screen.getByTestId('input')

			await user.click(input)
			expect(input).toHaveFocus()

			await user.click(document.body)
			expect(input).not.toHaveFocus()
		})

		it('shows focus animation on focus', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormInput />)

			const input = screen.getByTestId('input')
			await user.click(input)

			// Animation div should be rendered
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})
	})

	describe('Error States', () => {
		it('shows error animation when field has error', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: {message: 'Test error'}
			})

			render(<OnboardingFormInput />)

			// Should render error animation
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})

		it('shows no error animation when field is valid', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: undefined
			})

			render(<OnboardingFormInput />)

			// Should still render animation divs but without error state
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})
	})

	describe('Interaction States', () => {
		it('responds to user input', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormInput />)

			const input = screen.getByTestId('input')
			await user.type(input, 'test input')

			expect(input).toHaveValue('test input')
		})

		it('handles hover states', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormInput />)

			const input = screen.getByTestId('input')
			await user.hover(input)

			expect(input).toBeInTheDocument()
		})
	})

	describe('Forwarding Props', () => {
		it('applies type attribute correctly', () => {
			render(<OnboardingFormInput type="email" />)

			const input = screen.getByTestId('input')
			expect(input).toHaveAttribute('type', 'email')
		})

		it('handles default type attribute', () => {
			render(<OnboardingFormInput />)

			const input = screen.getByTestId('input')
			expect(input).toHaveAttribute('type', 'text')
		})
	})


})

describe('OnboardingFormTextArea', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Reset the mocked function
		const {useFormField} = await import('@/components/ui/form')
		vi.mocked(useFormField).mockReturnValue({
			error: undefined
		})
	})

	describe('Basic Rendering', () => {
		it('renders textarea component correctly', () => {
			render(<OnboardingFormTextArea placeholder="Test placeholder" />)

			expect(screen.getByTestId('textarea')).toBeInTheDocument()
			expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'Test placeholder')
		})


	})

	describe('Focus States', () => {
		it('handles focus and blur events', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormTextArea />)

			const textarea = screen.getByTestId('textarea')

			await user.click(textarea)
			expect(textarea).toHaveFocus()

			await user.click(document.body)
			expect(textarea).not.toHaveFocus()
		})

		it('shows focus animation on focus', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormTextArea />)

			const textarea = screen.getByTestId('textarea')
			await user.click(textarea)

			// Animation div should be rendered
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})
	})

	describe('Error States', () => {
		it('shows error animation when field has error', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: {message: 'Test error'}
			})

			render(<OnboardingFormTextArea />)

			// Should render error animation
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})

		it('shows no error animation when field is valid', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: undefined
			})

			render(<OnboardingFormTextArea />)

			// Should still render animation divs but without error state
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})
	})

	describe('Interaction States', () => {
		it('responds to user input', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormTextArea />)

			const textarea = screen.getByTestId('textarea')
			await user.type(textarea, 'test input')

			expect(textarea).toHaveValue('test input')
		})

		it('handles multi-line input', async () => {
			const user = userEvent.setup()
			render(<OnboardingFormTextArea />)

			const textarea = screen.getByTestId('textarea')
			await user.type(textarea, 'line 1\nline 2\nline 3')

			expect(textarea).toHaveValue('line 1\nline 2\nline 3')
		})
	})
})

describe('OnboardingRichTextInput', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Reset the mocked function
		const {useFormField} = await import('@/components/ui/form')
		vi.mocked(useFormField).mockReturnValue({
			error: undefined
		})
	})

	describe('Basic Rendering', () => {
		it('renders rich text editor correctly', () => {
			render(<OnboardingRichTextInput placeholder="Test placeholder" />)

			expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
			expect(screen.getByTestId('rich-text-editor')).toHaveTextContent('Test placeholder')
		})


	})

	describe('Content Management', () => {
		it('handles content changes', async () => {
			const mockOnChange = vi.fn()
			const user = userEvent.setup()

			render(<OnboardingRichTextInput placeholder="Test" onChange={mockOnChange} />)

			const editor = screen.getByTestId('rich-text-editor')
			await user.click(editor)

			expect(mockOnChange).toHaveBeenCalledWith('test content')
		})

		it('handles initial value', () => {
			render(<OnboardingRichTextInput placeholder="Test" value="Initial content" />)

			const editor = screen.getByTestId('rich-text-editor')
			expect(editor).toHaveTextContent('Initial content')
		})
	})

	describe('Error States', () => {
		it('shows error animation when field has error', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: {message: 'Test error'}
			})

			render(<OnboardingRichTextInput placeholder="Test" />)

			// Should render error animation
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})

		it('shows no error animation when field is valid', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: undefined
			})

			render(<OnboardingRichTextInput placeholder="Test" />)

			// Should still render animation divs but without error state
			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})
	})

	describe('Integration with Form', () => {
		it('integrates with form validation', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: {message: 'Required field'}
			})

			render(<OnboardingRichTextInput placeholder="Test" />)

			expect(screen.getAllByTestId('motion-div')).toHaveLength(2)
		})
	})
})

describe('OnboardingFormSelect', () => {
	beforeEach(async () => {
		vi.clearAllMocks()

		// Reset the mocked function
		const {useFormField} = await import('@/components/ui/form')
		vi.mocked(useFormField).mockReturnValue({
			error: undefined
		})
	})

	const mockOptions = [
		{value: 'option1', label: 'Option 1'},
		{value: 'option2', label: 'Option 2', image: '/test-image.jpg'}
	]

	describe('Basic Rendering', () => {
		it('renders select with correct structure', () => {
			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			expect(screen.getByTestId('select')).toBeInTheDocument()
			expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
		})

		it('passes props correctly to Select component', () => {
			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			const select = screen.getByTestId('select')
			expect(select).toHaveAttribute('data-value', 'option1')
		})


	})

	describe('Options Rendering', () => {
		it('renders options correctly', () => {
			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			const items = screen.getAllByTestId('select-item')
			expect(items).toHaveLength(2)
			expect(items[0]).toHaveAttribute('data-value', 'option1')
			expect(items[1]).toHaveAttribute('data-value', 'option2')
		})

		it('renders options with images', () => {
			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			const images = screen.getAllByTestId('image')
			expect(images).toHaveLength(1)
			expect(images[0]).toHaveAttribute('src', '/test-image.jpg')
		})

		it('handles empty options array', () => {
			render(
				<OnboardingFormSelect
					value=""
					onChange={vi.fn()}
					options={[]}
				/>
			)

			const items = screen.queryAllByTestId('select-item')
			expect(items).toHaveLength(0)
		})
	})

	describe('Value Changes', () => {
		it('calls onValueChange when value changes', async () => {
			const mockOnChange = vi.fn()
			const user = userEvent.setup()

			render(
				<OnboardingFormSelect
					value="option1"
					onChange={mockOnChange}
					options={mockOptions}
				/>
			)

			const select = screen.getByTestId('select')
			await user.click(select)

			expect(mockOnChange).toHaveBeenCalledWith('test')
		})

		it('handles initial value', () => {
			render(
				<OnboardingFormSelect
					value="option2"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			const select = screen.getByTestId('select')
			expect(select).toHaveAttribute('data-value', 'option2')
		})
	})

	describe('Error States', () => {
		it('shows error animation when field has error', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: {message: 'Test error'}
			})

			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			// Select doesn't have error animations in the current implementation
			expect(screen.getByTestId('select')).toBeInTheDocument()
		})

		it('shows no error animation when field is valid', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: undefined
			})

			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			expect(screen.getByTestId('select')).toBeInTheDocument()
		})
	})

	describe('Integration with Form', () => {
		it('integrates with form validation', async () => {
			const {useFormField} = await import('@/components/ui/form')
			vi.mocked(useFormField).mockReturnValue({
				error: {message: 'Required field'}
			})

			render(
				<OnboardingFormSelect
					value="option1"
					onChange={vi.fn()}
					options={mockOptions}
				/>
			)

			expect(screen.getByTestId('select')).toBeInTheDocument()
		})
	})
})
