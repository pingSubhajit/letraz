import React from 'react'
import {render, screen, userEvent} from '@/__tests__/helpers/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Toolbar from '@/components/richTextEditor/components/toolbar'
import type {Editor} from '@tiptap/react'
import type {CanCommands, ChainedCommands} from '@tiptap/core'

// Mock external dependencies
vi.mock('@radix-ui/react-icons', () => ({
	DotsHorizontalIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="dots-horizontal-icon">
			Dots
		</div>
	),
	FontBoldIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="font-bold-icon">
			Bold
		</div>
	),
	FontItalicIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="font-italic-icon">
			Italic
		</div>
	),
	UnderlineIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="underline-icon">
			Underline
		</div>
	),
	ListBulletIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="list-bullet-icon">
			Bullet List
		</div>
	),
	CaretDownIcon: ({className}: {className?: string}) => (
		<div className={className} data-testid="caret-down-icon">
			Caret Down
		</div>
	)
}))

vi.mock('lucide-react', () => ({
	Link2Icon: ({className}: {className?: string}) => (
		<div className={className} data-testid="link2-icon">
			Link
		</div>
	)
}))

vi.mock('@/components/ui/toggle', () => ({
	Toggle: React.forwardRef<HTMLButtonElement, any>(({children, className, size, ...props}, ref) => (
		<button
			ref={ref}
			className={className}
			data-size={size}
			{...props}
			data-testid="toggle-button"
		>
			{children}
		</button>
	)),
	toggleVariants: vi.fn()
}))

// Mock the ToolbarButton component to handle isActive prop
vi.mock('@/components/richTextEditor/components/toolbar-button', () => ({
	ToolbarButton: React.forwardRef<HTMLButtonElement, any>(({children, isActive, className, size, tooltip, ...props}, ref) => {
		const button = (
			<button
				ref={ref}
				className={`${className} ${isActive ? 'bg-accent' : ''}`}
				data-testid="toggle-button"
				data-size={size}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						props.onClick?.()
					}
				}}
				{...props}
			>
				{children}
			</button>
		)

		if (!tooltip) {
			return button
		}

		return (
			<div data-testid="tooltip">
				<div data-testid="tooltip-trigger" data-as-child="true">
					{button}
				</div>
				<div data-testid="tooltip-content">
					<div className="flex flex-col items-center text-center">{tooltip}</div>
				</div>
			</div>
		)
	})
}))

vi.mock('@/components/ui/tooltip', () => ({
	Tooltip: ({children}: {children: React.ReactNode}) => (
		<div data-testid="tooltip">{children}</div>
	),
	TooltipTrigger: ({children, asChild}: {children: React.ReactNode, asChild?: boolean}) => (
		<div data-testid="tooltip-trigger" data-as-child={asChild}>
			{children}
		</div>
	),
	TooltipContent: ({children, ...props}: {children: React.ReactNode}) => (
		<div data-testid="tooltip-content" {...props}>
			{children}
		</div>
	),
	TooltipProvider: ({children}: {children: React.ReactNode}) => (
		<div data-testid="tooltip-provider">{children}</div>
	)
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
	DropdownMenu: ({children}: {children: React.ReactNode}) => (
		<div data-testid="dropdown-menu">{children}</div>
	),
	DropdownMenuTrigger: ({children, asChild}: {children: React.ReactNode, asChild?: boolean}) => (
		<div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
			{children}
		</div>
	),
	DropdownMenuContent: ({children, align, className}: {children: React.ReactNode, align?: string, className?: string}) => (
		<div data-testid="dropdown-menu-content" data-align={align} className={className}>
			{children}
		</div>
	),
	DropdownMenuItem: ({children, onClick, disabled, className, ...props}: {
		children: React.ReactNode
		onClick?: () => void
		disabled?: boolean
		className?: string
	}) => (
		<div
			data-testid="dropdown-menu-item"
			onClick={onClick}
			data-disabled={disabled}
			className={className}
			{...props}
		>
			{children}
		</div>
	)
}))

vi.mock('@/components/ui/popover', () => ({
	Popover: ({children, open, onOpenChange}: {
		children: React.ReactNode
		open?: boolean
		onOpenChange?: (open: boolean) => void
	}) => (
		<div data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)}>
			{children}
		</div>
	),
	PopoverTrigger: ({children, asChild}: {children: React.ReactNode, asChild?: boolean}) => (
		<div data-testid="popover-trigger" data-as-child={asChild}>
			{children}
		</div>
	),
	PopoverContent: ({children, className, align, side}: {
		children: React.ReactNode
		className?: string
		align?: string
		side?: string
	}) => (
		<div data-testid="popover-content" className={className} data-align={align} data-side={side}>
			{children}
		</div>
	)
}))

vi.mock('@/components/richTextEditor/components/link/link-edit-block', () => ({
	LinkEditBlock: ({onSave, defaultText}: {onSave: (url: string, text?: string, openInNewTab?: boolean) => void, defaultText?: string}) => (
		<div data-testid="link-edit-block" data-default-text={defaultText}>
			<button onClick={() => onSave('https://example.com', 'Example', false)}>
				Save Link
			</button>
		</div>
	)
}))

vi.mock('@/components/richTextEditor/components/shortcut-key', () => ({
	ShortcutKey: ({keys}: {keys: string[]}) => (
		<div data-testid="shortcut-key" data-keys={keys.join(',')}>
			{keys.join('+')}
		</div>
	)
}))

vi.mock('@/components/richTextEditor/utils', () => ({
	getShortcutKey: (key: string) => ({
		symbol: key === 'mod' ? '⌘' : key.toUpperCase()
	})
}))

vi.mock('@/lib/utils', () => ({
	cn: (...classes: any[]) => {
		return classes
			.filter(Boolean)
			.map(cls => {
				if (typeof cls === 'string') return cls
				if (typeof cls === 'object') {
					return Object.entries(cls)
						.filter(([, value]) => value)
						.map(([key]) => key)
						.join(' ')
				}
				return ''
			})
			.join(' ')
			.trim()
	}
}))

// Create mock chain commands
const createMockChain = (): ChainedCommands => {
	const mockChain = {
		focus: vi.fn(() => mockChain),
		toggleBold: vi.fn(() => mockChain),
		toggleItalic: vi.fn(() => mockChain),
		toggleUnderline: vi.fn(() => mockChain),
		toggleOrderedList: vi.fn(() => mockChain),
		toggleBulletList: vi.fn(() => mockChain),
		extendMarkRange: vi.fn(() => mockChain),
		insertContent: vi.fn(() => mockChain),
		setLink: vi.fn(() => mockChain),
		enter: vi.fn(() => mockChain),
		run: vi.fn(() => true)
	} as unknown as ChainedCommands
	return mockChain
}

// Create mock can commands
const createMockCan = (returnValue = true): CanCommands => {
	const mockCanChain = {
		focus: vi.fn(() => ({
			toggleBold: vi.fn(() => ({
				run: vi.fn(() => returnValue)
			})),
			toggleItalic: vi.fn(() => ({
				run: vi.fn(() => returnValue)
			})),
			toggleUnderline: vi.fn(() => ({
				run: vi.fn(() => returnValue)
			})),
			toggleOrderedList: vi.fn(() => ({
				run: vi.fn(() => returnValue)
			})),
			toggleBulletList: vi.fn(() => ({
				run: vi.fn(() => returnValue)
			}))
		}))
	}

	const mockCan = {
		chain: vi.fn(() => mockCanChain)
	} as unknown as CanCommands
	return mockCan
}

// Create mock editor
const createMockEditor = (overrides: Partial<Editor> = {}): Editor => {
	const baseEditor = {
		chain: vi.fn(() => createMockChain()),
		can: vi.fn(() => createMockCan()),
		isActive: vi.fn((format: string) => {
			if (format === 'bold') return false
			if (format === 'italic') return false
			if (format === 'underline') return false
			if (format === 'orderedList') return false
			if (format === 'bulletList') return false
			if (format === 'link') return false
			if (format === 'codeBlock') return false
			return false
		}),
		commands: {
			enter: vi.fn()
		},
		state: {
			selection: {
				from: 0,
				to: 0
			},
			doc: {
				textBetween: vi.fn(() => '')
			}
		},
		...overrides
	} as unknown as Editor

	return baseEditor
}

describe('Toolbar Component', () => {
	let mockEditor: Editor

	beforeEach(() => {
		vi.clearAllMocks()
		mockEditor = createMockEditor()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders without crashing', () => {
			render(<Toolbar editor={mockEditor} />)
			// Check for the main toolbar container
			const toolbarContainer = screen.getByTestId('tooltip-provider').firstChild as HTMLElement
			expect(toolbarContainer).toBeInTheDocument()
		})

		it('renders with custom props', () => {
			render(
				<Toolbar
					editor={mockEditor}
					size="lg"
					variant="outline"
					activeActions={['bold', 'italic']}
					mainActionCount={2}
				/>
			)
			// Should render main action buttons when mainActionCount > 0
			expect(screen.getByLabelText('Bold')).toBeInTheDocument()
			expect(screen.getByLabelText('Italic')).toBeInTheDocument()
		})

		it('applies correct container styling', () => {
			const {container} = render(<Toolbar editor={mockEditor} />)
			// The toolbar container is nested inside the tooltip provider
			const toolbarContainer = container.querySelector('.shrink-0.overflow-x-auto.p-2')
			expect(toolbarContainer).toBeInTheDocument()
			expect(toolbarContainer).toHaveClass('shrink-0', 'overflow-x-auto', 'p-2')
		})

		it('renders toolbar content wrapper', () => {
			const {container} = render(<Toolbar editor={mockEditor} />)
			const contentWrapper = container.querySelector('.flex.w-max.items-center.gap-1')
			expect(contentWrapper).toBeInTheDocument()
		})
	})

	describe('Toolbar Buttons Rendering', () => {
		it('renders all formatting buttons in dropdown by default', () => {
			render(<Toolbar editor={mockEditor} />)

			// By default, all actions go to dropdown (mainActionCount = 0)
			expect(screen.getByTestId('dots-horizontal-icon')).toBeInTheDocument()

			// Check for all format action labels in dropdown
			expect(screen.getByLabelText('Bold')).toBeInTheDocument()
			expect(screen.getByLabelText('Italic')).toBeInTheDocument()
			expect(screen.getByLabelText('Underline')).toBeInTheDocument()
			expect(screen.getByLabelText('Numbered list')).toBeInTheDocument()
			expect(screen.getByLabelText('Bullet list')).toBeInTheDocument()
		})

		it('renders main action buttons when mainActionCount is set', () => {
			render(<Toolbar editor={mockEditor} mainActionCount={3} />)

			// Should render first 3 actions as main buttons
			const toggleButtons = screen.getAllByTestId('toggle-button')
			expect(toggleButtons.length).toBeGreaterThanOrEqual(3) // At least 3 (plus link button)
		})

		it('renders link edit popover', () => {
			render(<Toolbar editor={mockEditor} />)
			expect(screen.getByTestId('link2-icon')).toBeInTheDocument()
		})

		it('renders dropdown menu for additional actions', () => {
			render(<Toolbar editor={mockEditor} mainActionCount={2} />)
			expect(screen.getByTestId('dots-horizontal-icon')).toBeInTheDocument()
		})

		it('renders buttons with correct tooltips', () => {
			render(<Toolbar editor={mockEditor} />)

			// All buttons should be wrapped in tooltips
			const tooltips = screen.getAllByTestId('tooltip')
			expect(tooltips.length).toBeGreaterThan(0)
		})

		it('renders buttons with correct aria-labels', () => {
			render(<Toolbar editor={mockEditor} />)

			// These should be available either as buttons or dropdown items
			expect(screen.getByLabelText('Bold')).toBeInTheDocument()
			expect(screen.getByLabelText('Italic')).toBeInTheDocument()
			expect(screen.getByLabelText('Underline')).toBeInTheDocument()
			expect(screen.getByLabelText('Numbered list')).toBeInTheDocument()
			expect(screen.getByLabelText('Bullet list')).toBeInTheDocument()
			expect(screen.getByLabelText('Insert link')).toBeInTheDocument()
		})
	})

	describe('Formatting Actions', () => {
		it('executes bold action when bold button is clicked', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const boldButton = screen.getByLabelText('Bold')
			await user.click(boldButton)

			expect(mockEditor.chain).toHaveBeenCalled()
		})

		it('executes italic action when italic button is clicked', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const italicButton = screen.getByLabelText('Italic')
			await user.click(italicButton)

			expect(mockEditor.chain).toHaveBeenCalled()
		})

		it('executes underline action when underline button is clicked', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const underlineButton = screen.getByLabelText('Underline')
			await user.click(underlineButton)

			expect(mockEditor.chain).toHaveBeenCalled()
		})

		it('executes ordered list action when numbered list button is clicked', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const orderedListButton = screen.getByLabelText('Numbered list')
			await user.click(orderedListButton)

			expect(mockEditor.chain).toHaveBeenCalled()
		})

		it('executes bullet list action when bullet list button is clicked', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const bulletListButton = screen.getByLabelText('Bullet list')
			await user.click(bulletListButton)

			expect(mockEditor.chain).toHaveBeenCalled()
		})

		it('handles link insertion through popover', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} />)

			// Click link button to open popover
			const linkButton = screen.getByLabelText('Insert link')
			await user.click(linkButton)

			// Click save link in the mock link edit block
			const saveLinkButton = screen.getByText('Save Link')
			await user.click(saveLinkButton)

			expect(mockEditor.chain).toHaveBeenCalled()
		})
	})

	describe('State Management', () => {
		it('shows active state for bold when editor has bold active (main toolbar)', () => {
			const editorWithBold = createMockEditor({
				isActive: vi.fn((format: string) => format === 'bold')
			})

			render(<Toolbar editor={editorWithBold} mainActionCount={5} />)

			const boldButton = screen.getByLabelText('Bold')
			expect(boldButton).toHaveClass('bg-accent')
		})

		it('shows active state for bold when editor has bold active (dropdown)', () => {
			const editorWithBold = createMockEditor({
				isActive: vi.fn((format: string) => format === 'bold')
			})

			render(<Toolbar editor={editorWithBold} />)

			const boldButton = screen.getByLabelText('Bold')
			// In dropdown, the active state is applied via className which includes bg-accent
			expect(boldButton.className).toContain('bg-accent')
		})

		it('shows active state for italic when editor has italic active', () => {
			const editorWithItalic = createMockEditor({
				isActive: vi.fn((format: string) => format === 'italic')
			})

			render(<Toolbar editor={editorWithItalic} mainActionCount={5} />)

			const italicButton = screen.getByLabelText('Italic')
			expect(italicButton).toHaveClass('bg-accent')
		})

		it('shows active state for underline when editor has underline active', () => {
			const editorWithUnderline = createMockEditor({
				isActive: vi.fn((format: string) => format === 'underline')
			})

			render(<Toolbar editor={editorWithUnderline} mainActionCount={5} />)

			const underlineButton = screen.getByLabelText('Underline')
			expect(underlineButton).toHaveClass('bg-accent')
		})

		it('shows active state for ordered list when editor has ordered list active', () => {
			const editorWithOrderedList = createMockEditor({
				isActive: vi.fn((format: string) => format === 'orderedList')
			})

			render(<Toolbar editor={editorWithOrderedList} mainActionCount={5} />)

			const orderedListButton = screen.getByLabelText('Numbered list')
			expect(orderedListButton).toHaveClass('bg-accent')
		})

		it('shows active state for bullet list when editor has bullet list active', () => {
			const editorWithBulletList = createMockEditor({
				isActive: vi.fn((format: string) => format === 'bulletList')
			})

			render(<Toolbar editor={editorWithBulletList} mainActionCount={5} />)

			const bulletListButton = screen.getByLabelText('Bullet list')
			expect(bulletListButton).toHaveClass('bg-accent')
		})

		it('shows active state for link when editor has link active', () => {
			const editorWithLink = createMockEditor({
				isActive: vi.fn((format: string) => format === 'link')
			})

			render(<Toolbar editor={editorWithLink} />)

			const linkButton = screen.getByLabelText('Insert link')
			expect(linkButton).toHaveClass('bg-accent')
		})

		it('shows multiple active states simultaneously', () => {
			const editorWithMultiple = createMockEditor({
				isActive: vi.fn((format: string) => ['bold', 'italic'].includes(format))
			})

			render(<Toolbar editor={editorWithMultiple} mainActionCount={5} />)

			const boldButton = screen.getByLabelText('Bold')
			const italicButton = screen.getByLabelText('Italic')
			const underlineButton = screen.getByLabelText('Underline')

			expect(boldButton).toHaveClass('bg-accent')
			expect(italicButton).toHaveClass('bg-accent')
			expect(underlineButton).not.toHaveClass('bg-accent')
		})
	})

	describe('Disabled States', () => {
		it('disables buttons when canExecute returns false', () => {
			const editorWithDisabled = createMockEditor({
				can: vi.fn(() => createMockCan(false))
			})

			render(<Toolbar editor={editorWithDisabled} />)

			const boldButton = screen.getByLabelText('Bold')
			expect(boldButton).toHaveAttribute('data-disabled', 'true')
		})

		it('disables formatting buttons in code block', () => {
			const editorInCodeBlock = createMockEditor({
				isActive: vi.fn((format: string) => format === 'codeBlock')
			})

			render(<Toolbar editor={editorInCodeBlock} />)

			const boldButton = screen.getByLabelText('Bold')
			const italicButton = screen.getByLabelText('Italic')
			const underlineButton = screen.getByLabelText('Underline')

			expect(boldButton).toHaveAttribute('data-disabled', 'true')
			expect(italicButton).toHaveAttribute('data-disabled', 'true')
			expect(underlineButton).toHaveAttribute('data-disabled', 'true')
		})

		it('disables link button in code block', () => {
			const editorInCodeBlock = createMockEditor({
				isActive: vi.fn((format: string) => format === 'codeBlock')
			})

			render(<Toolbar editor={editorInCodeBlock} />)

			const linkButton = screen.getByLabelText('Insert link')
			expect(linkButton).toBeDisabled()
		})

		it('enables list buttons in code block', () => {
			const editorInCodeBlock = createMockEditor({
				isActive: vi.fn((format: string) => format === 'codeBlock')
			})

			render(<Toolbar editor={editorInCodeBlock} />)

			const orderedListButton = screen.getByLabelText('Numbered list')
			const bulletListButton = screen.getByLabelText('Bullet list')

			// List buttons should not be disabled in code blocks
			expect(orderedListButton).not.toHaveAttribute('data-disabled', 'true')
			expect(bulletListButton).not.toHaveAttribute('data-disabled', 'true')
		})
	})

	describe('Responsive Behavior', () => {
		it('renders with overflow scroll for small containers', () => {
			const {container} = render(<Toolbar editor={mockEditor} />)
			const toolbarContainer = container.querySelector('.overflow-x-auto')
			expect(toolbarContainer).toBeInTheDocument()
			expect(toolbarContainer).toHaveClass('overflow-x-auto')
		})

		it('renders content with max width for scrolling', () => {
			const {container} = render(<Toolbar editor={mockEditor} />)
			const contentWrapper = container.querySelector('.w-max')
			expect(contentWrapper).toBeInTheDocument()
		})

		it('adapts to different mainActionCount values', () => {
			render(<Toolbar editor={mockEditor} mainActionCount={3} />)

			// Should render dropdown for remaining actions
			expect(screen.getByTestId('dots-horizontal-icon')).toBeInTheDocument()
		})

		it('hides dropdown when all actions fit in main toolbar', () => {
			render(<Toolbar editor={mockEditor} mainActionCount={10} />)

			// Should not render dropdown when all actions fit
			expect(screen.queryByTestId('dots-horizontal-icon')).not.toBeInTheDocument()
		})

		it('renders with different size variants', () => {
			render(<Toolbar editor={mockEditor} size="lg" mainActionCount={3} />)

			const toggleButtons = screen.getAllByTestId('toggle-button')
			toggleButtons.forEach(button => {
				expect(button).toHaveAttribute('data-size', 'lg')
			})
		})

		it('renders with different variant styles', () => {
			render(<Toolbar editor={mockEditor} variant="outline" mainActionCount={3} />)

			// Variant should be passed to toolbar buttons
			const toggleButtons = screen.getAllByTestId('toggle-button')
			expect(toggleButtons.length).toBeGreaterThan(0)
		})
	})

	describe('Toolbar Adaptation', () => {
		it('filters actions based on activeActions prop', () => {
			render(<Toolbar editor={mockEditor} activeActions={['bold', 'italic']} />)

			// Should only render specified actions
			expect(screen.getByLabelText('Bold')).toBeInTheDocument()
			expect(screen.getByLabelText('Italic')).toBeInTheDocument()
			expect(screen.queryByLabelText('Underline')).not.toBeInTheDocument()
		})

		it('maintains action order based on activeActions', () => {
			render(<Toolbar editor={mockEditor} activeActions={['italic', 'bold']} mainActionCount={2} />)

			// Check that italic appears before bold as main action buttons
			const toggleButtons = screen.getAllByTestId('toggle-button')
			const actionButtons = toggleButtons.filter(btn => btn.getAttribute('aria-label') === 'Italic' ||
				btn.getAttribute('aria-label') === 'Bold')

			expect(actionButtons[0]).toHaveAttribute('aria-label', 'Italic')
			expect(actionButtons[1]).toHaveAttribute('aria-label', 'Bold')
		})

		it('splits actions between main toolbar and dropdown', () => {
			render(
				<Toolbar
					editor={mockEditor}
					activeActions={['bold', 'italic', 'underline']}
					mainActionCount={2}
				/>
			)

			// Should have main actions visible as buttons
			const toggleButtons = screen.getAllByTestId('toggle-button')
			const mainActionButtons = toggleButtons.filter(btn => btn.getAttribute('aria-label') === 'Bold' ||
				btn.getAttribute('aria-label') === 'Italic')
			expect(mainActionButtons.length).toBe(2)

			// Should have dropdown for remaining actions
			expect(screen.getByTestId('dots-horizontal-icon')).toBeInTheDocument()
			expect(screen.getByLabelText('Underline')).toBeInTheDocument()
		})

		it('shows dropdown active state when dropdown actions are active', () => {
			const editorWithUnderline = createMockEditor({
				isActive: vi.fn((format: string) => format === 'underline')
			})

			render(
				<Toolbar
					editor={editorWithUnderline}
					activeActions={['bold', 'italic', 'underline']}
					mainActionCount={2}
				/>
			)

			// Dropdown button should show active state
			const dropdownButton = screen.getByLabelText('More formatting')
			expect(dropdownButton).toHaveClass('bg-accent')
		})
	})

	describe('Keyboard Navigation', () => {
		it('supports tab navigation through buttons', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} />)

			// Tab through buttons
			await user.tab()
			expect(document.activeElement).toHaveAttribute('aria-label')

			await user.tab()
			expect(document.activeElement).toHaveAttribute('aria-label')
		})

		it('supports keyboard activation of buttons', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const boldButton = screen.getByLabelText('Bold')

			// Clear any previous calls
			vi.clearAllMocks()

			// Focus and press Enter
			boldButton.focus()
			await user.keyboard('{Enter}')
			expect(mockEditor.chain).toHaveBeenCalled()
		})

		it('supports space key activation of buttons', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const boldButton = screen.getByLabelText('Bold')

			// Clear any previous calls
			vi.clearAllMocks()

			// Focus and press Space
			boldButton.focus()
			await user.keyboard(' ')
			expect(mockEditor.chain).toHaveBeenCalled()
		})
	})

	describe('Accessibility', () => {
		it('provides proper ARIA labels for all buttons', () => {
			render(<Toolbar editor={mockEditor} />)

			expect(screen.getByLabelText('Bold')).toBeInTheDocument()
			expect(screen.getByLabelText('Italic')).toBeInTheDocument()
			expect(screen.getByLabelText('Underline')).toBeInTheDocument()
			expect(screen.getByLabelText('Numbered list')).toBeInTheDocument()
			expect(screen.getByLabelText('Bullet list')).toBeInTheDocument()
			expect(screen.getByLabelText('Insert link')).toBeInTheDocument()
		})

		it('provides tooltips with keyboard shortcuts', () => {
			render(<Toolbar editor={mockEditor} />)

			// Tooltips should contain shortcut information
			const tooltipContents = screen.getAllByTestId('tooltip-content')
			expect(tooltipContents.length).toBeGreaterThan(0)
		})

		it('maintains focus visibility', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			await user.tab()

			// Focus should be on a focusable element
			expect(document.activeElement).toHaveAttribute('aria-label')
		})

		it('provides proper toolbar structure', () => {
			const {container} = render(<Toolbar editor={mockEditor} />)

			// Check that the toolbar container exists
			const toolbarContainer = container.querySelector('.shrink-0.overflow-x-auto.p-2')
			expect(toolbarContainer).toBeInTheDocument()
		})

		it('handles disabled state accessibility', () => {
			const editorWithDisabled = createMockEditor({
				can: vi.fn(() => createMockCan(false))
			})

			render(<Toolbar editor={editorWithDisabled} />)

			const boldButton = screen.getByLabelText('Bold')
			expect(boldButton).toHaveAttribute('data-disabled', 'true')
		})
	})

	describe('Edge Cases', () => {
		it('handles editor state changes gracefully', () => {
			const {rerender} = render(<Toolbar editor={mockEditor} mainActionCount={5} />)

			const newEditor = createMockEditor({
				isActive: vi.fn((format: string) => format === 'bold')
			})

			rerender(<Toolbar editor={newEditor} mainActionCount={5} />)

			const boldButton = screen.getByLabelText('Bold')
			expect(boldButton).toHaveClass('bg-accent')
		})

		it('handles empty activeActions array', () => {
			render(<Toolbar editor={mockEditor} activeActions={[]} />)

			// Should still render link button as it's separate
			expect(screen.getByLabelText('Insert link')).toBeInTheDocument()

			// Should not render format action buttons
			expect(screen.queryByLabelText('Bold')).not.toBeInTheDocument()
		})

		it('handles undefined activeActions', () => {
			render(<Toolbar editor={mockEditor} activeActions={undefined} />)

			// Should render all default actions
			expect(screen.getByLabelText('Bold')).toBeInTheDocument()
			expect(screen.getByLabelText('Italic')).toBeInTheDocument()
		})

		it('handles zero mainActionCount', () => {
			render(<Toolbar editor={mockEditor} mainActionCount={0} />)

			// All actions should be in dropdown
			expect(screen.getByTestId('dots-horizontal-icon')).toBeInTheDocument()
		})

		it('handles large mainActionCount', () => {
			render(<Toolbar editor={mockEditor} mainActionCount={100} />)

			// Should not render dropdown when count exceeds available actions
			expect(screen.queryByTestId('dots-horizontal-icon')).not.toBeInTheDocument()
		})

		it('handles rapid button clicks', async () => {
			const user = userEvent.setup()
			render(<Toolbar editor={mockEditor} />)

			const boldButton = screen.getByLabelText('Bold')

			// Clear any previous calls
			vi.clearAllMocks()

			// Rapid clicks should not break the component
			await user.click(boldButton)
			await user.click(boldButton)
			await user.click(boldButton)

			// Note: clicks on dropdown items trigger the action once per click
			expect(mockEditor.chain).toHaveBeenCalledTimes(3)
		})

		it('handles component unmounting gracefully', () => {
			const {unmount} = render(<Toolbar editor={mockEditor} />)

			expect(() => unmount()).not.toThrow()
		})
	})
})
