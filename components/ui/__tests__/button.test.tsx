import React from 'react'
import {render, screen, userEvent} from '@/__tests__/helpers/test-utils'
import {Button} from '@/components/ui/button'
import {vi} from 'vitest'

describe('Button Component', () => {
	describe('Rendering', () => {
		it('renders with correct text content', () => {
			render(<Button>Click me</Button>)
			expect(screen.getByRole('button')).toHaveTextContent('Click me')
		})

		it('renders as button element by default', () => {
			render(<Button>Test Button</Button>)
			const button = screen.getByRole('button')
			expect(button.tagName).toBe('BUTTON')
		})

		it('renders with default type="button"', () => {
			render(<Button>Test Button</Button>)
			expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
		})

		it('renders with custom type when specified', () => {
			render(<Button type="submit">Submit</Button>)
			expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
		})

		it('renders children correctly', () => {
			render(
				<Button>
					<span>Icon</span>
					<span>Text</span>
				</Button>
			)
			expect(screen.getByText('Icon')).toBeInTheDocument()
			expect(screen.getByText('Text')).toBeInTheDocument()
		})

		it('forwards ref correctly', () => {
			const ref = React.createRef<HTMLButtonElement>()
			render(<Button ref={ref}>Test</Button>)
			expect(ref.current).toBeInstanceOf(HTMLButtonElement)
		})
	})

	describe('Props and Attributes', () => {
		it('applies custom className', () => {
			render(<Button className="custom-class">Test</Button>)
			expect(screen.getByRole('button')).toHaveClass('custom-class')
		})

		it('spreads additional props', () => {
			render(<Button data-testid="custom-button" aria-label="Custom label">Test</Button>)
			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('data-testid', 'custom-button')
			expect(button).toHaveAttribute('aria-label', 'Custom label')
		})

		it('handles disabled state', () => {
			render(<Button disabled>Disabled Button</Button>)
			expect(screen.getByRole('button')).toBeDisabled()
		})

		it('applies disabled styling when disabled', () => {
			render(<Button disabled>Disabled Button</Button>)
			expect(screen.getByRole('button')).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
		})
	})

	describe('Variants', () => {
		it('applies default variant styles', () => {
			render(<Button>Default</Button>)
			expect(screen.getByRole('button')).toHaveClass('bg-flame-500', 'text-primary-foreground')
		})

		it('applies destructive variant styles', () => {
			render(<Button variant="destructive">Delete</Button>)
			expect(screen.getByRole('button')).toHaveClass('bg-destructive', 'text-destructive-foreground')
		})

		it('applies outline variant styles', () => {
			render(<Button variant="outline">Outline</Button>)
			expect(screen.getByRole('button')).toHaveClass('border', 'border-input', 'bg-background')
		})

		it('applies secondary variant styles', () => {
			render(<Button variant="secondary">Secondary</Button>)
			expect(screen.getByRole('button')).toHaveClass('bg-secondary', 'text-secondary-foreground')
		})

		it('applies ghost variant styles', () => {
			render(<Button variant="ghost">Ghost</Button>)
			expect(screen.getByRole('button')).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
		})

		it('applies link variant styles', () => {
			render(<Button variant="link">Link</Button>)
			expect(screen.getByRole('button')).toHaveClass('text-primary', 'underline-offset-4')
		})
	})

	describe('Sizes', () => {
		it('applies default size styles', () => {
			render(<Button>Default Size</Button>)
			expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4', 'py-2')
		})

		it('applies small size styles', () => {
			render(<Button size="sm">Small</Button>)
			expect(screen.getByRole('button')).toHaveClass('h-9', 'px-3')
		})

		it('applies large size styles', () => {
			render(<Button size="lg">Large</Button>)
			expect(screen.getByRole('button')).toHaveClass('h-11', 'px-8')
		})

		it('applies icon size styles', () => {
			render(<Button size="icon">🔥</Button>)
			expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10')
		})
	})

	describe('Base Styles', () => {
		it('applies base button styles', () => {
			render(<Button>Test</Button>)
			const button = screen.getByRole('button')
			expect(button).toHaveClass(
				'inline-flex',
				'items-center',
				'justify-center',
				'whitespace-nowrap',
				'rounded-md',
				'text-sm',
				'font-medium',
				'ring-offset-background',
				'transition'
			)
		})

		it('applies focus styles', () => {
			render(<Button>Test</Button>)
			expect(screen.getByRole('button')).toHaveClass(
				'focus-visible:outline-none',
				'focus-visible:ring-2',
				'focus-visible:ring-ring',
				'focus-visible:ring-offset-2'
			)
		})

		it('applies hover transform effect', () => {
			render(<Button>Test</Button>)
			expect(screen.getByRole('button')).toHaveClass('hover:-translate-y-0.5')
		})
	})

	describe('User Interactions', () => {
		it('handles click events', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()

			render(<Button onClick={handleClick}>Click me</Button>)

			await user.click(screen.getByRole('button'))
			expect(handleClick).toHaveBeenCalledOnce()
		})

		it('handles multiple clicks', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()

			render(<Button onClick={handleClick}>Click me</Button>)

			await user.click(screen.getByRole('button'))
			await user.click(screen.getByRole('button'))
			await user.click(screen.getByRole('button'))

			expect(handleClick).toHaveBeenCalledTimes(3)
		})

		it('does not trigger click when disabled', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()

			render(<Button onClick={handleClick} disabled>Disabled</Button>)

			await user.click(screen.getByRole('button'))
			expect(handleClick).not.toHaveBeenCalled()
		})

		it('handles keyboard interactions (Enter)', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()

			render(<Button onClick={handleClick}>Press Enter</Button>)

			const button = screen.getByRole('button')
			button.focus()
			await user.keyboard('{Enter}')

			expect(handleClick).toHaveBeenCalledOnce()
		})

		it('handles keyboard interactions (Space)', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()

			render(<Button onClick={handleClick}>Press Space</Button>)

			const button = screen.getByRole('button')
			button.focus()
			await user.keyboard(' ')

			expect(handleClick).toHaveBeenCalledOnce()
		})

		it('receives focus when tabbed to', async () => {
			const user = userEvent.setup()

			render(
				<div>
					<input data-testid="input" />
					<Button>Focusable Button</Button>
				</div>
			)

			const input = screen.getByTestId('input')
			const button = screen.getByRole('button')

			input.focus()
			await user.tab()

			expect(button).toHaveFocus()
		})

		it('does not receive focus when disabled', async () => {
			const user = userEvent.setup()

			render(
				<div>
					<input data-testid="input" />
					<Button disabled>Disabled Button</Button>
					<input data-testid="input2" />
				</div>
			)

			const input = screen.getByTestId('input')
			const button = screen.getByRole('button')
			const input2 = screen.getByTestId('input2')

			input.focus()
			await user.tab()

			expect(button).not.toHaveFocus()
			expect(input2).toHaveFocus()
		})
	})

	describe('asChild Prop', () => {
		it('renders as Slot when asChild is true', () => {
			render(
				<Button asChild>
					<a href="/test">Link Button</a>
				</Button>
			)

			const link = screen.getByRole('link')
			expect(link).toHaveAttribute('href', '/test')
			expect(link).toHaveTextContent('Link Button')
		})

		it('applies button styles to child element when asChild is true', () => {
			render(
				<Button asChild variant="destructive" size="lg">
					<a href="/test">Styled Link</a>
				</Button>
			)

			const link = screen.getByRole('link')
			expect(link).toHaveClass('bg-destructive', 'h-11', 'px-8')
		})

		it('merges className with child element when asChild is true', () => {
			render(
				<Button asChild className="custom-class">
					<a href="/test" className="existing-class">Link</a>
				</Button>
			)

			const link = screen.getByRole('link')
			expect(link).toHaveClass('custom-class', 'existing-class')
		})
	})

	describe('Variant and Size Combinations', () => {
		it('combines variant and size styles correctly', () => {
			render(<Button variant="outline" size="sm">Small Outline</Button>)
			const button = screen.getByRole('button')

			// Should have both variant and size classes
			expect(button).toHaveClass('border', 'border-input') // outline variant
			expect(button).toHaveClass('h-9', 'px-3') // sm size
		})

		it('handles all variant and size combinations', () => {
			const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
			const sizes = ['default', 'sm', 'lg', 'icon'] as const

			variants.forEach(variant => {
				sizes.forEach(size => {
					const {unmount} = render(
						<Button variant={variant} size={size}>
							{variant} {size}
						</Button>
					)

					const button = screen.getByRole('button')
					expect(button).toBeInTheDocument()
					expect(button).toHaveTextContent(`${variant} ${size}`)

					unmount()
				})
			})
		})
	})

	describe('Event Handling Edge Cases', () => {
		it('handles onClick with event object', async () => {
			const user = userEvent.setup()
			const handleClick = vi.fn()

			render(<Button onClick={handleClick}>Test</Button>)

			await user.click(screen.getByRole('button'))

			expect(handleClick).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'click',
					target: expect.any(HTMLElement)
				})
			)
		})

		it('handles onMouseDown and onMouseUp events', async () => {
			const user = userEvent.setup()
			const handleMouseDown = vi.fn()
			const handleMouseUp = vi.fn()

			render(
				<Button onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
					Test
				</Button>
			)

			const button = screen.getByRole('button')
			await user.pointer({keys: '[MouseLeft>]', target: button})
			expect(handleMouseDown).toHaveBeenCalledOnce()

			await user.pointer({keys: '[/MouseLeft]', target: button})
			expect(handleMouseUp).toHaveBeenCalledOnce()
		})

		it('handles onFocus and onBlur events', async () => {
			const user = userEvent.setup()
			const handleFocus = vi.fn()
			const handleBlur = vi.fn()

			render(
				<div>
					<Button onFocus={handleFocus} onBlur={handleBlur}>Test</Button>
					<input data-testid="other-input" />
				</div>
			)

			const button = screen.getByRole('button')
			const input = screen.getByTestId('other-input')

			await user.click(button)
			expect(handleFocus).toHaveBeenCalledOnce()

			await user.click(input)
			expect(handleBlur).toHaveBeenCalledOnce()
		})
	})

	describe('Accessibility', () => {
		it('has correct role', () => {
			render(<Button>Accessible Button</Button>)
			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		it('supports aria-label', () => {
			render(<Button aria-label="Close dialog">×</Button>)
			expect(screen.getByRole('button')).toHaveAccessibleName('Close dialog')
		})

		it('supports aria-describedby', () => {
			render(
				<div>
					<Button aria-describedby="help-text">Submit</Button>
					<div id="help-text">This will submit the form</div>
				</div>
			)

			expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'help-text')
		})

		it('maintains focus visibility styles', () => {
			render(<Button>Focus me</Button>)
			const button = screen.getByRole('button')

			expect(button).toHaveClass(
				'focus-visible:outline-none',
				'focus-visible:ring-2',
				'focus-visible:ring-ring'
			)
		})

		it('announces disabled state to screen readers', () => {
			render(<Button disabled>Disabled Button</Button>)
			expect(screen.getByRole('button')).toHaveAttribute('disabled')
		})
	})
})
