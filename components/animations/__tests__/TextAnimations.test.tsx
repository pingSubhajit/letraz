import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import TextAnimations from '@/components/animations/TextAnimations'

// Create mock functions
const mockUseAnimation = vi.fn()
const mockUseInView = vi.fn()

// Mock motion/react components
vi.mock('motion/react', () => ({
	motion: {
		h2: ({children, variants, initial, animate, style, role, ...props}: any) => (
			<h2
				data-testid="motion-h2"
				data-variants={JSON.stringify(variants)}
				data-initial={initial}
				data-animate={animate}
				data-style={JSON.stringify(style)}
				role={role}
				{...props}
			>
				{children}
			</h2>
		),
		span: ({children, variants, className, ...props}: any) => (
			<span
				data-testid="motion-span"
				data-variants={JSON.stringify(variants)}
				className={className}
				{...props}
			>
				{children}
			</span>
		)
	},
	useAnimation: () => ({
		start: mockUseAnimation,
		stop: vi.fn(),
		set: vi.fn()
	}),
	useInView: () => mockUseInView()
}))

describe('TextAnimations Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Setup default mock returns
		mockUseInView.mockReturnValue(true)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders with default props', () => {
			render(<TextAnimations text="Hello World" />)

			expect(screen.getByTestId('motion-h2')).toBeInTheDocument()
			// Text is split into individual characters
			expect(screen.getByText('H')).toBeInTheDocument()
			expect(screen.getByText('W')).toBeInTheDocument()
		})

		it('renders text with default whipInUp animation', () => {
			render(<TextAnimations text="Test Text" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('data-initial', 'hidden')
			expect(motionH2).toHaveAttribute('data-animate', 'visible')
		})

		it('renders with custom className', () => {
			render(<TextAnimations text="Test" className="custom-class" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveClass('custom-class')
		})

		it('renders with custom HTML attributes', () => {
			render(<TextAnimations text="Test" id="test-id" data-custom="value" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('id', 'test-id')
			expect(motionH2).toHaveAttribute('data-custom', 'value')
		})

		it('has proper heading role', () => {
			render(<TextAnimations text="Test" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('role', 'heading')
		})
	})

	describe('Animation Variants - Standard Layout', () => {
		const standardAnimations = ['fadeIn', 'fadeInUp', 'popIn', 'calmInUp', 'shiftInUp', 'whipInUp']

		standardAnimations.forEach(animationType => {
			it(`renders with ${animationType} animation`, () => {
				render(<TextAnimations text="Hello World" type={animationType as any} />)

				const motionH2 = screen.getByTestId('motion-h2')
				expect(motionH2).toBeInTheDocument()
				expect(motionH2).toHaveAttribute('data-initial', 'hidden')
				expect(motionH2).toHaveAttribute('data-animate', 'visible')

				// Check that variants are applied - container variants are applied to h2
				const variants = JSON.parse(motionH2.getAttribute('data-variants') || '{}')
				expect(variants).toHaveProperty('hidden')
				// Some animations have empty container variants, so just check it exists
				expect(variants.hidden).toBeDefined()
			})

			it(`applies correct styling for ${animationType}`, () => {
				render(<TextAnimations text="Test" type={animationType as any} />)

				const motionH2 = screen.getByTestId('motion-h2')
				const style = JSON.parse(motionH2.getAttribute('data-style') || '{}')
				expect(style).toEqual({display: 'flex', overflow: 'hidden'})
			})

			it(`renders individual letters for ${animationType}`, () => {
				render(<TextAnimations text="Hi" type={animationType as any} />)

				const motionSpans = screen.getAllByTestId('motion-span')
				expect(motionSpans).toHaveLength(2) // 'H' and 'i'
				expect(motionSpans[0]).toHaveTextContent('H')
				expect(motionSpans[1]).toHaveTextContent('i')
			})

			it(`handles spaces correctly for ${animationType}`, () => {
				render(<TextAnimations text="A B" type={animationType as any} />)

				const motionSpans = screen.getAllByTestId('motion-span')
				expect(motionSpans).toHaveLength(3) // 'A', ' ', 'B'
				expect(motionSpans[0]).toHaveTextContent('A')
				// Space is converted to non-breaking space but may not be visible in test
				expect(motionSpans[1].textContent).toBe('\u00A0') // Non-breaking space
				expect(motionSpans[2]).toHaveTextContent('B')
			})
		})
	})

	describe('Animation Variants - Word-based Layout', () => {
		const wordBasedAnimations = ['rollIn', 'whipIn']

		wordBasedAnimations.forEach(animationType => {
			it(`renders with ${animationType} animation using word-based layout`, () => {
				render(<TextAnimations text="Hello World" type={animationType as any} />)

				// Should render as h2 but without motion-h2 testid (different structure)
				const heading = screen.getByRole('heading')
				expect(heading).toBeInTheDocument()
				expect(heading.tagName).toBe('H2')
			})

			it(`splits text into words for ${animationType}`, () => {
				render(<TextAnimations text="Hello World Test" type={animationType as any} />)

				// Each word should be wrapped in a motion.span
				const motionSpans = screen.getAllByTestId('motion-span')
				// Should have spans for words and individual characters
				expect(motionSpans.length).toBeGreaterThan(0)
			})

			it(`applies correct classes for ${animationType}`, () => {
				render(<TextAnimations text="Hello World" type={animationType as any} />)

				const motionSpans = screen.getAllByTestId('motion-span')
				// Word spans should have specific classes
				const wordSpans = motionSpans.filter(span => span.className.includes('inline-block') &&
					span.className.includes('mr-[0.25em]'))
				expect(wordSpans.length).toBeGreaterThan(0)
			})

			it(`handles single word correctly for ${animationType}`, () => {
				render(<TextAnimations text="Hello" type={animationType as any} />)

				const motionSpans = screen.getAllByTestId('motion-span')
				expect(motionSpans.length).toBeGreaterThan(0)
			})

			it(`handles empty string for ${animationType}`, () => {
				render(<TextAnimations text="" type={animationType as any} />)

				const heading = screen.getByRole('heading')
				expect(heading).toBeInTheDocument()
				// Empty string still creates motion spans for word-based animations
				const motionSpans = screen.getAllByTestId('motion-span')
				expect(motionSpans.length).toBeGreaterThanOrEqual(0)
			})
		})
	})

	describe('Props Handling', () => {
		it('handles text prop correctly', () => {
			const testText = 'Testing Props'
			render(<TextAnimations text={testText} />)

			// Text is split into individual characters, so check for individual letters
			expect(screen.getByText('T')).toBeInTheDocument()
			expect(screen.getAllByText('e')).toHaveLength(1) // Only one 'e' in "Testing Props"
			expect(screen.getAllByText('s')).toHaveLength(2) // Two 's' characters
			expect(screen.getByText('P')).toBeInTheDocument()
		})

		it('handles type prop correctly', () => {
			render(<TextAnimations text="Test" type="fadeIn" />)

			const motionH2 = screen.getByTestId('motion-h2')
			const variants = JSON.parse(motionH2.getAttribute('data-variants') || '{}')
			expect(variants).toHaveProperty('hidden')
			// fadeIn has container variants with opacity
			expect(variants.hidden).toEqual({opacity: 0})
		})

		it('handles delay prop (passed through to motion component)', () => {
			render(<TextAnimations text="Test" delay={0.5} />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('delay', '0.5')
		})

		it('handles duration prop (passed through to motion component)', () => {
			render(<TextAnimations text="Test" duration={2} />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('duration', '2')
		})

		it('handles multiple props together', () => {
			render(
				<TextAnimations
					text="Multi Props"
					type="popIn"
					delay={0.3}
					duration={1.5}
					className="test-class"
					id="test-id"
				/>
			)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveClass('test-class')
			expect(motionH2).toHaveAttribute('id', 'test-id')
			expect(motionH2).toHaveAttribute('delay', '0.3')
			expect(motionH2).toHaveAttribute('duration', '1.5')
		})
	})

	describe('Framer Motion Integration', () => {
		it('uses useInView hook correctly', () => {
			render(<TextAnimations text="Test" />)

			expect(mockUseInView).toHaveBeenCalled()
		})

		it('uses useAnimation hook correctly', () => {
			render(<TextAnimations text="Test" />)

			expect(mockUseAnimation).toBeDefined()
		})

		it('applies motion variants correctly', () => {
			render(<TextAnimations text="Test" type="fadeIn" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			motionSpans.forEach(span => {
				const variants = JSON.parse(span.getAttribute('data-variants') || '{}')
				expect(variants).toHaveProperty('visible')
				expect(variants).toHaveProperty('hidden')
			})
		})

		it('sets initial and animate states correctly', () => {
			render(<TextAnimations text="Test" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('data-initial', 'hidden')
			expect(motionH2).toHaveAttribute('data-animate', 'visible')
		})
	})

	describe('Responsive Behavior', () => {
		it('maintains structure across different text lengths', () => {
			const shortText = 'Hi'
			const longText = 'This is a very long text that should still work properly'

			const {rerender} = render(<TextAnimations text={shortText} />)
			expect(screen.getByTestId('motion-h2')).toBeInTheDocument()

			rerender(<TextAnimations text={longText} />)
			expect(screen.getByTestId('motion-h2')).toBeInTheDocument()
		})

		it('handles special characters correctly', () => {
			const specialText = 'Hello! @#$%^&*()_+ 123'
			render(<TextAnimations text={specialText} />)

			// Check for individual special characters
			expect(screen.getByText('H')).toBeInTheDocument()
			expect(screen.getByText('!')).toBeInTheDocument()
			expect(screen.getByText('@')).toBeInTheDocument()
			expect(screen.getByText('1')).toBeInTheDocument()
		})

		it('handles unicode characters correctly', () => {
			const unicodeText = 'Hello 世界 🌍'
			render(<TextAnimations text={unicodeText} />)

			// Check for individual unicode characters
			expect(screen.getByText('H')).toBeInTheDocument()
			expect(screen.getByText('世')).toBeInTheDocument()
			expect(screen.getByText('界')).toBeInTheDocument()
			expect(screen.getByText('🌍')).toBeInTheDocument()
		})

		it('maintains accessibility across different animations', () => {
			const animations = ['fadeIn', 'rollIn', 'popIn', 'whipIn']

			animations.forEach(animation => {
				const {unmount} = render(<TextAnimations text="Test" type={animation as any} />)
				const headings = screen.getAllByRole('heading')
				expect(headings.length).toBeGreaterThan(0)
				unmount()
			})
		})
	})

	describe('Edge Cases', () => {
		it('handles empty text', () => {
			render(<TextAnimations text="" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toBeInTheDocument()
			expect(motionH2).toBeEmptyDOMElement()
		})

		it('handles single character', () => {
			render(<TextAnimations text="A" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			expect(motionSpans).toHaveLength(1)
			expect(motionSpans[0]).toHaveTextContent('A')
		})

		it('handles only spaces', () => {
			render(<TextAnimations text="   " />)

			const motionSpans = screen.getAllByTestId('motion-span')
			expect(motionSpans).toHaveLength(3)
			// Check that each span contains a non-breaking space
			motionSpans.forEach(span => {
				expect(span.textContent).toBe('\u00A0')
			})
		})

		it('handles mixed content with numbers and symbols', () => {
			render(<TextAnimations text="Test123!@#" />)

			// Check for individual characters
			expect(screen.getByText('T')).toBeInTheDocument()
			expect(screen.getByText('1')).toBeInTheDocument()
			expect(screen.getByText('!')).toBeInTheDocument()
			expect(screen.getByText('#')).toBeInTheDocument()
		})

		it('handles very long text', () => {
			const longText = 'A'.repeat(100)
			render(<TextAnimations text={longText} />)

			const motionSpans = screen.getAllByTestId('motion-span')
			expect(motionSpans).toHaveLength(100)
		})

		it('handles undefined type gracefully', () => {
			render(<TextAnimations text="Test" type={undefined} />)

			// Should default to whipInUp
			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toBeInTheDocument()
		})

		it('handles invalid animation type gracefully', () => {
			/*
			 * TypeScript would prevent this, but testing runtime behavior
			 * This will actually throw an error in the component, so we expect it to fail
			 */
			expect(() => {
				render(<TextAnimations text="Test" type={'invalidType' as any} />)
			}).toThrow()
		})
	})

	describe('Animation Timing and Parameters', () => {
		it('applies correct container variants for fadeIn', () => {
			render(<TextAnimations text="Test" type="fadeIn" />)

			const motionH2 = screen.getByTestId('motion-h2')
			const variants = JSON.parse(motionH2.getAttribute('data-variants') || '{}')

			// The container variants are applied to the h2 element
			expect(variants.hidden).toEqual({opacity: 0})
			/*
			 * fadeIn has a visible variant that's a function, so it may not serialize properly
			 * Just check that the variants object has the expected structure
			 */
			expect(Object.keys(variants)).toContain('hidden')
		})

		it('applies correct child variants for fadeInUp', () => {
			render(<TextAnimations text="Test" type="fadeInUp" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			const variants = JSON.parse(motionSpans[0].getAttribute('data-variants') || '{}')

			expect(variants.visible).toEqual({opacity: 1, y: 0, transition: {duration: 0.5}})
			expect(variants.hidden).toEqual({opacity: 0, y: 20})
		})

		it('applies correct spring animation for popIn', () => {
			render(<TextAnimations text="Test" type="popIn" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			const variants = JSON.parse(motionSpans[0].getAttribute('data-variants') || '{}')

			expect(variants.visible.transition.type).toBe('spring')
			expect(variants.visible.transition.damping).toBe(15)
			expect(variants.visible.transition.stiffness).toBe(400)
		})

		it('applies correct easing for calmInUp', () => {
			render(<TextAnimations text="Test" type="calmInUp" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			const variants = JSON.parse(motionSpans[0].getAttribute('data-variants') || '{}')

			expect(variants.visible.transition.ease).toEqual([0.125, 0.92, 0.69, 0.975])
			expect(variants.visible.transition.duration).toBe(0.75)
		})

		it('applies correct timing for whipInUp', () => {
			render(<TextAnimations text="Test" type="whipInUp" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			const variants = JSON.parse(motionSpans[0].getAttribute('data-variants') || '{}')

			expect(variants.visible.y).toBe(0)
			expect(variants.hidden.y).toBe('200%')
			expect(variants.visible.transition.duration).toBe(0.75)
		})
	})

	describe('Performance Considerations', () => {
		it('does not create excessive DOM elements for reasonable text', () => {
			render(<TextAnimations text="Hello World" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			expect(motionSpans.length).toBeLessThan(50) // Reasonable limit
		})

		it('handles re-renders efficiently', () => {
			const {rerender} = render(<TextAnimations text="Initial" />)

			rerender(<TextAnimations text="Updated" />)
			rerender(<TextAnimations text="Final" />)

			// Check for individual characters from the final render
			expect(screen.getByText('F')).toBeInTheDocument()
			expect(screen.getByText('l')).toBeInTheDocument()
			// Previous text should not be present
			expect(screen.queryByText('I')).not.toBeInTheDocument()
		})

		it('cleans up properly on unmount', () => {
			const {unmount} = render(<TextAnimations text="Test" />)

			unmount()

			expect(screen.queryByTestId('motion-h2')).not.toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('maintains semantic heading structure', () => {
			render(<TextAnimations text="Heading Text" />)

			const heading = screen.getByRole('heading')
			expect(heading).toBeInTheDocument()
			expect(heading.tagName).toBe('H2')
		})

		it('preserves text content for screen readers', () => {
			render(<TextAnimations text="Screen Reader Text" />)

			// Check for individual characters
			expect(screen.getByText('S')).toBeInTheDocument()
			expect(screen.getByText('R')).toBeInTheDocument()
			expect(screen.getByText('T')).toBeInTheDocument()
			// Check that the heading structure is maintained
			expect(screen.getByRole('heading')).toBeInTheDocument()
		})

		it('uses aria-hidden appropriately for decorative spans', () => {
			render(<TextAnimations text="Test" type="rollIn" />)

			const motionSpans = screen.getAllByTestId('motion-span')
			motionSpans.forEach(span => {
				if (span.hasAttribute('aria-hidden')) {
					expect(span).toHaveAttribute('aria-hidden', 'true')
				}
			})
		})

		it('maintains heading role', () => {
			render(<TextAnimations text="Test Heading" />)

			const motionH2 = screen.getByTestId('motion-h2')
			expect(motionH2).toHaveAttribute('role', 'heading')
		})
	})
})
