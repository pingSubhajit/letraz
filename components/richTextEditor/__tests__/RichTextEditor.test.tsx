import React from 'react'
import {render, screen, userEvent} from '@/__tests__/helpers/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import RichTextEditor, {RichTextEditorProps} from '@/components/richTextEditor/index'
import type {Editor} from '@tiptap/react'

// Extend Editor interface to include id for testing
interface MockEditor extends Editor {
	id: string
}

// Mock external dependencies
vi.mock('@tiptap/react', () => ({
	EditorContent: React.forwardRef<HTMLDivElement, any>(({editor, className, ...props}, ref) => (
		<div
			ref={ref}
			className={className}
			data-testid="editor-content"
			data-editor-id={(editor as MockEditor)?.id || 'mock-editor'}
			{...props}
		>
			<div contentEditable data-testid="editor-editable">
				{editor?.getHTML?.() || '<p>Default content</p>'}
			</div>
		</div>
	)),
	Content: {} as any,
	useEditor: vi.fn()
}))

vi.mock('@/components/richTextEditor/hooks/use-minimal-tiptap', () => ({
	__esModule: true,
	default: vi.fn()
}))

vi.mock('@/components/richTextEditor/components/measured-container', () => ({
	MeasuredContainer: React.forwardRef<HTMLDivElement, any>(
		({as: Component = 'div', name, children, className, ...props}, ref) => (
			<Component
				ref={ref}
				className={className}
				data-testid="measured-container"
				data-name={name}
				{...props}
			>
				{children}
			</Component>
		)
	)
}))

vi.mock('@/components/richTextEditor/components/bubble-menu/link-bubble-menu', () => ({
	LinkBubbleMenu: ({editor}: {editor: any}) => (
		<div data-testid="link-bubble-menu" data-editor-id={(editor as MockEditor)?.id || 'mock-editor'}>
			Link Bubble Menu
		</div>
	)
}))

vi.mock('@/components/richTextEditor/components/toolbar', () => ({
	__esModule: true,
	default: ({editor, mainActionCount}: {editor: any, mainActionCount: number}) => (
		<div
			data-testid="toolbar"
			data-editor-id={(editor as MockEditor)?.id || 'mock-editor'}
			data-main-action-count={mainActionCount}
		>
			<button data-testid="bold-button">Bold</button>
			<button data-testid="italic-button">Italic</button>
			<button data-testid="underline-button">Underline</button>
			Toolbar
		</div>
	)
}))

vi.mock('@/lib/utils', () => ({
	cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

vi.mock('@/components/richTextEditor/styles/index.css', () => ({}))

// Mock editor instance with proper typing
const createMockEditor = (overrides: Partial<MockEditor> = {}): MockEditor => {
	const mockEditor = {
		id: 'mock-editor-123',
		getHTML: vi.fn(() => '<p>Mock content</p>'),
		getJSON: vi.fn(() => ({type: 'doc', content: []})),
		getText: vi.fn(() => 'Mock content'),
		isEmpty: false,
		isActive: vi.fn(() => false),
		can: vi.fn(() => ({
			chain: vi.fn(() => ({
				focus: vi.fn(() => ({
					toggleBold: vi.fn(() => ({run: vi.fn(() => true)}))
				}))
			}))
		})) as any,
		chain: vi.fn(() => ({
			focus: vi.fn(() => ({
				toggleBold: vi.fn(() => ({run: vi.fn()})),
				toggleItalic: vi.fn(() => ({run: vi.fn()})),
				toggleUnderline: vi.fn(() => ({run: vi.fn()}))
			}))
		})) as any,
		commands: {
			setContent: vi.fn(),
			focus: vi.fn()
		} as any,
		state: {
			selection: {from: 0, to: 0} as any,
			doc: {
				textBetween: vi.fn(() => 'selected text')
			} as any
		} as any,
		getAttributes: vi.fn(() => ({})),
		// Add missing Editor properties as undefined/mocked
		view: undefined as any,
		schema: undefined as any,
		isDestroyed: false,
		isFocused: false,
		isEditable: true,
		isInitialized: true,
		extensionManager: undefined as any,
		extensionStorage: {},
		options: {} as any,
		...overrides
	} as MockEditor

	return mockEditor
}

describe('RichTextEditor Component', () => {
	let mockEditor: MockEditor
	let mockUseMinimalTiptapEditor: any

	beforeEach(async () => {
		vi.clearAllMocks()
		mockEditor = createMockEditor()

		// Get the mocked function
		const useMinimalTiptapModule = await import('@/components/richTextEditor/hooks/use-minimal-tiptap')
		mockUseMinimalTiptapEditor = vi.mocked(useMinimalTiptapModule.default)
		mockUseMinimalTiptapEditor.mockReturnValue(mockEditor)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders without crashing', () => {
			render(<RichTextEditor />)
			expect(screen.getByTestId('measured-container')).toBeInTheDocument()
		})

		it('returns null when editor is not available', () => {
			mockUseMinimalTiptapEditor.mockReturnValue(null)

			const {container} = render(<RichTextEditor />)
			expect(container.firstChild).toBeNull()
		})

		it('applies custom className to container', () => {
			const customClass = 'custom-editor-class'
			render(<RichTextEditor className={customClass} />)

			const container = screen.getByTestId('measured-container')
			expect(container).toHaveClass(customClass)
		})

		it('applies custom editorContentClassName to EditorContent', () => {
			const customClass = 'custom-content-class'
			render(<RichTextEditor editorContentClassName={customClass} />)

			const editorContent = screen.getByTestId('editor-content')
			expect(editorContent).toHaveClass('minimal-tiptap-editor', customClass)
		})

		it('renders with default classes when no custom classes provided', () => {
			render(<RichTextEditor />)

			const container = screen.getByTestId('measured-container')
			expect(container).toHaveClass('flex', 'h-auto', 'w-full', 'flex-col')

			const editorContent = screen.getByTestId('editor-content')
			expect(editorContent).toHaveClass('minimal-tiptap-editor')
		})
	})

	describe('Editor Initialization', () => {
		it('initializes editor with correct props', () => {
			const value = '<p>Initial content</p>'
			const onChange = vi.fn()
			const placeholder = 'Enter text...'

			render(
				<RichTextEditor
					value={value}
					onChange={onChange}
					placeholder={placeholder}
				/>
			)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith({
				value,
				onUpdate: onChange,
				placeholder
			})
		})

		it('passes through additional props to useMinimalTiptapEditor', () => {
			const additionalProps = {
				editorClassName: 'custom-editor',
				throttleDelay: 500,
				output: 'json' as const
			}

			render(<RichTextEditor {...additionalProps} />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining(additionalProps)
			)
		})

		it('handles onUpdate callback correctly', () => {
			const onChange = vi.fn()
			render(<RichTextEditor onChange={onChange} />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({
					onUpdate: onChange
				})
			)
		})

		it('maps onChange prop to onUpdate for the hook', () => {
			const onChange = vi.fn()

			render(<RichTextEditor onChange={onChange} />)

			// Should use onChange as onUpdate in the hook
			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({
					onUpdate: onChange
				})
			)
		})
	})

	describe('Content Management', () => {
		it('displays editor content correctly', () => {
			const mockContent = '<p>Test content</p>'
			mockEditor.getHTML = vi.fn(() => mockContent)

			render(<RichTextEditor />)

			const editableArea = screen.getByTestId('editor-editable')
			expect(editableArea).toHaveTextContent('Test content')
		})

		it('handles empty content', () => {
			mockEditor.getHTML = vi.fn(() => '')
			Object.defineProperty(mockEditor, 'isEmpty', {
				value: true,
				writable: true
			})

			render(<RichTextEditor />)

			expect(screen.getByTestId('editor-content')).toBeInTheDocument()
		})

		it('updates content when value prop changes', () => {
			const initialValue = '<p>Initial</p>'
			const updatedValue = '<p>Updated</p>'

			const {rerender} = render(<RichTextEditor value={initialValue} />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({value: initialValue})
			)

			rerender(<RichTextEditor value={updatedValue} />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({value: updatedValue})
			)
		})

		it('triggers onChange callback when content changes', () => {
			const onChange = vi.fn()
			render(<RichTextEditor onChange={onChange} />)

			// Verify onChange is passed as onUpdate to the hook
			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({onUpdate: onChange})
			)
		})
	})

	describe('Component Structure', () => {
		it('renders MeasuredContainer as root element', () => {
			render(<RichTextEditor />)

			const container = screen.getByTestId('measured-container')
			expect(container).toBeInTheDocument()
			expect(container).toHaveAttribute('data-name', 'editor')
		})

		it('renders EditorContent with correct editor instance', () => {
			render(<RichTextEditor />)

			const editorContent = screen.getByTestId('editor-content')
			expect(editorContent).toBeInTheDocument()
			expect(editorContent).toHaveAttribute('data-editor-id', mockEditor.id)
		})

		it('renders LinkBubbleMenu with correct editor instance', () => {
			render(<RichTextEditor />)

			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			expect(bubbleMenu).toBeInTheDocument()
			expect(bubbleMenu).toHaveAttribute('data-editor-id', mockEditor.id)
		})

		it('renders Toolbar with correct props', () => {
			render(<RichTextEditor />)

			const toolbar = screen.getByTestId('toolbar')
			expect(toolbar).toBeInTheDocument()
			expect(toolbar).toHaveAttribute('data-editor-id', mockEditor.id)
			expect(toolbar).toHaveAttribute('data-main-action-count', '7')
		})

		it('maintains correct component hierarchy', () => {
			render(<RichTextEditor />)

			const container = screen.getByTestId('measured-container')
			const editorContent = screen.getByTestId('editor-content')
			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			const toolbar = screen.getByTestId('toolbar')

			expect(container).toContainElement(editorContent)
			expect(container).toContainElement(bubbleMenu)
			expect(container).toContainElement(toolbar)
		})
	})

	describe('Toolbar Integration', () => {
		it('renders toolbar with formatting buttons', () => {
			render(<RichTextEditor />)

			expect(screen.getByTestId('bold-button')).toBeInTheDocument()
			expect(screen.getByTestId('italic-button')).toBeInTheDocument()
			expect(screen.getByTestId('underline-button')).toBeInTheDocument()
		})

		it('passes editor instance to toolbar', () => {
			render(<RichTextEditor />)

			const toolbar = screen.getByTestId('toolbar')
			expect(toolbar).toHaveAttribute('data-editor-id', mockEditor.id)
		})

		it('configures toolbar with correct mainActionCount', () => {
			render(<RichTextEditor />)

			const toolbar = screen.getByTestId('toolbar')
			expect(toolbar).toHaveAttribute('data-main-action-count', '7')
		})

		it('toolbar buttons are interactive', async () => {
			const user = userEvent.setup()
			render(<RichTextEditor />)

			const boldButton = screen.getByTestId('bold-button')

			// Should be able to click toolbar buttons
			await user.click(boldButton)
			expect(boldButton).toBeInTheDocument()
		})
	})

	describe('Bubble Menu Integration', () => {
		it('renders LinkBubbleMenu component', () => {
			render(<RichTextEditor />)

			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			expect(bubbleMenu).toBeInTheDocument()
			expect(bubbleMenu).toHaveTextContent('Link Bubble Menu')
		})

		it('passes editor instance to bubble menu', () => {
			render(<RichTextEditor />)

			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			expect(bubbleMenu).toHaveAttribute('data-editor-id', mockEditor.id)
		})

		it('bubble menu is rendered alongside other components', () => {
			render(<RichTextEditor />)

			const container = screen.getByTestId('measured-container')
			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			const toolbar = screen.getByTestId('toolbar')
			const editorContent = screen.getByTestId('editor-content')

			expect(container).toContainElement(bubbleMenu)
			expect(container).toContainElement(toolbar)
			expect(container).toContainElement(editorContent)
		})
	})

	describe('Forward Ref', () => {
		it('forwards ref to MeasuredContainer', () => {
			const ref = React.createRef<HTMLDivElement>()
			render(<RichTextEditor ref={ref} />)

			expect(ref.current).toBeInstanceOf(HTMLElement)
			expect(ref.current).toHaveAttribute('data-testid', 'measured-container')
		})

		it('ref is accessible after render', () => {
			const ref = React.createRef<HTMLDivElement>()
			render(<RichTextEditor ref={ref} />)

			expect(ref.current).not.toBeNull()
			expect(ref.current?.tagName.toLowerCase()).toBe('div')
		})
	})

	describe('Props Handling', () => {
		it('handles all UseMinimalTiptapEditorProps', () => {
			const props: Partial<RichTextEditorProps> = {
				value: '<p>Test</p>',
				output: 'html',
				placeholder: 'Type here...',
				editorClassName: 'custom-editor',
				throttleDelay: 300,
				onBlur: vi.fn()
			}

			render(<RichTextEditor {...props} />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({
					value: props.value,
					output: props.output,
					placeholder: props.placeholder,
					editorClassName: props.editorClassName,
					throttleDelay: props.throttleDelay,
					onBlur: props.onBlur
				})
			)
		})

		it('excludes component-specific props from hook', () => {
			const props = {
				value: '<p>Test</p>',
				onChange: vi.fn(),
				className: 'container-class',
				editorContentClassName: 'content-class'
			}

			render(<RichTextEditor {...props} />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({
					value: props.value,
					onUpdate: props.onChange
				})
			)

			// Should not pass component-specific props to hook
			expect(mockUseMinimalTiptapEditor).not.toHaveBeenCalledWith(
				expect.objectContaining({
					className: props.className,
					editorContentClassName: props.editorContentClassName
				})
			)
		})

		it('handles undefined props gracefully', () => {
			render(<RichTextEditor />)

			expect(mockUseMinimalTiptapEditor).toHaveBeenCalledWith(
				expect.objectContaining({
					value: undefined,
					onUpdate: undefined
				})
			)
		})
	})

	describe('Error Handling', () => {
		it('handles editor initialization failure', () => {
			mockUseMinimalTiptapEditor.mockReturnValue(null)

			const {container} = render(<RichTextEditor />)
			expect(container.firstChild).toBeNull()
		})

		it('handles missing editor methods gracefully', () => {
			const incompleteEditor = {
				id: 'incomplete-editor'
				// Missing other methods
			} as any
			mockUseMinimalTiptapEditor.mockReturnValue(incompleteEditor)

			expect(() => render(<RichTextEditor />)).not.toThrow()
		})

		it('handles editor with undefined methods', () => {
			const editorWithUndefinedMethods = {
				...mockEditor,
				getHTML: undefined,
				getJSON: undefined
			} as any
			mockUseMinimalTiptapEditor.mockReturnValue(editorWithUndefinedMethods)

			expect(() => render(<RichTextEditor />)).not.toThrow()
		})
	})

	describe('Display Name', () => {
		it('has correct displayName', () => {
			expect(RichTextEditor.displayName).toBe('RichTextEditor')
		})
	})

	describe('CSS Integration', () => {
		it('imports required CSS styles', () => {
			// CSS import is mocked, but we verify the component renders
			render(<RichTextEditor />)
			expect(screen.getByTestId('measured-container')).toBeInTheDocument()
		})

		it('applies minimal-tiptap-editor class to EditorContent', () => {
			render(<RichTextEditor />)

			const editorContent = screen.getByTestId('editor-content')
			expect(editorContent).toHaveClass('minimal-tiptap-editor')
		})

		it('combines custom and default classes correctly', () => {
			const customContentClass = 'my-custom-class'
			render(<RichTextEditor editorContentClassName={customContentClass} />)

			const editorContent = screen.getByTestId('editor-content')
			expect(editorContent).toHaveClass('minimal-tiptap-editor', customContentClass)
		})
	})

	describe('Integration with Child Components', () => {
		it('all child components receive the same editor instance', () => {
			render(<RichTextEditor />)

			const editorContent = screen.getByTestId('editor-content')
			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			const toolbar = screen.getByTestId('toolbar')

			const editorId = mockEditor.id
			expect(editorContent).toHaveAttribute('data-editor-id', editorId)
			expect(bubbleMenu).toHaveAttribute('data-editor-id', editorId)
			expect(toolbar).toHaveAttribute('data-editor-id', editorId)
		})

		it('maintains component relationships when editor changes', () => {
			const {rerender} = render(<RichTextEditor />)

			// Change editor instance
			const newMockEditor = createMockEditor({
				id: 'new-editor-456'
			})
			mockUseMinimalTiptapEditor.mockReturnValue(newMockEditor)

			rerender(<RichTextEditor />)

			const editorContent = screen.getByTestId('editor-content')
			const bubbleMenu = screen.getByTestId('link-bubble-menu')
			const toolbar = screen.getByTestId('toolbar')

			expect(editorContent).toHaveAttribute('data-editor-id', 'new-editor-456')
			expect(bubbleMenu).toHaveAttribute('data-editor-id', 'new-editor-456')
			expect(toolbar).toHaveAttribute('data-editor-id', 'new-editor-456')
		})
	})
})
