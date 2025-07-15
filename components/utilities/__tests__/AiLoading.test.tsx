import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import AiLoading from '../AiLoading'

// Mock motion components
vi.mock('motion/react', () => ({
	AnimatePresence: ({children}: { children: React.ReactNode }) => <div data-testid="animate-presence">{children}</div>,
	motion: {
		div: ({children, initial, animate, exit, className, ...props}: any) => (
			<div
				className={className}
				data-testid="motion-div"
				data-initial={JSON.stringify(initial)}
				data-animate={JSON.stringify(animate)}
				data-exit={JSON.stringify(exit)}
				{...props}
			>
				{children}
			</div>
		)
	}
}))

describe('AiLoading Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic Rendering', () => {
		it('renders when loading is true', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
			expect(screen.getByTestId('motion-div')).toBeInTheDocument()
			expect(screen.getByText('Loading...')).toBeInTheDocument()
		})

		it('does not render when loading is false', () => {
			render(<AiLoading loading={false} text="Loading..." />)

			expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
			expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument()
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
		})

		it('renders with custom text', () => {
			render(<AiLoading loading={true} text="Processing your request..." />)

			expect(screen.getByText('Processing your request...')).toBeInTheDocument()
		})
	})

	describe('Video Element', () => {
		it('renders video element with correct attributes', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const video = document.querySelector('video') as HTMLVideoElement
			expect(video).toBeInTheDocument()
			expect(video).toHaveAttribute('autoplay')
			expect(video).toHaveAttribute('loop')
		})

		it('renders video with default source', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const video = document.querySelector('video') as HTMLVideoElement
			const source = video.querySelector('source')
			expect(source).toHaveAttribute('src', '/letraz-brain.webm')
			expect(source).toHaveAttribute('type', 'video/webm')
		})


	})

	describe('Text Display', () => {
		it('displays loading text correctly', () => {
			render(<AiLoading loading={true} text="Loading content..." />)

			expect(screen.getByText('Loading content...')).toBeInTheDocument()
		})


	})


	describe('Edge Cases', () => {
		it('handles empty text gracefully', () => {
			render(<AiLoading loading={true} text="" />)

			const textElement = screen.getByRole('paragraph')
			expect(textElement).toBeInTheDocument()
		})

		it('handles undefined text gracefully', () => {
			render(<AiLoading loading={true} text={undefined as any} />)

			const textElement = screen.getByRole('paragraph')
			expect(textElement).toBeInTheDocument()
		})

		it('handles very long text', () => {
			const longText = 'A'.repeat(1000)
			render(<AiLoading loading={true} text={longText} />)

			expect(screen.getByText(longText)).toBeInTheDocument()
		})

		it('handles special characters in text', () => {
			const specialText = 'Loading... 🚀 & special chars: <>?'
			render(<AiLoading loading={true} text={specialText} />)

			expect(screen.getByText(specialText)).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('provides proper structure for screen readers', () => {
			render(<AiLoading loading={true} text="Loading content..." />)

			// Text should be readable
			expect(screen.getByText('Loading content...')).toBeInTheDocument()

			// Video should have proper attributes
			const video = document.querySelector('video') as HTMLVideoElement
			expect(video).toHaveAttribute('autoplay')
			expect(video).toHaveAttribute('loop')
		})

		it('maintains proper semantic structure', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			// Should have proper paragraph structure
			const textElement = screen.getByRole('paragraph')
			expect(textElement).toHaveTextContent('Loading...')
		})
	})

	describe('Performance Considerations', () => {
		it('only renders when loading is true', () => {
			const {rerender} = render(<AiLoading loading={false} text="Loading..." />)

			expect(document.querySelector('video')).not.toBeInTheDocument()
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument()

			rerender(<AiLoading loading={true} text="Loading..." />)

			expect(document.querySelector('video')).toBeInTheDocument()
			expect(screen.getByText('Loading...')).toBeInTheDocument()
		})

		it('properly unmounts when loading becomes false', () => {
			const {rerender} = render(<AiLoading loading={true} text="Loading..." />)

			expect(document.querySelector('video')).toBeInTheDocument()

			rerender(<AiLoading loading={false} text="Loading..." />)

			expect(document.querySelector('video')).not.toBeInTheDocument()
		})
	})

	describe('Animation States', () => {
		it('renders with AnimatePresence wrapper', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const animatePresence = screen.getByTestId('animate-presence')
			expect(animatePresence).toBeInTheDocument()
		})

		it('applies correct initial animation state', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveAttribute('data-initial', '{"opacity":0}')
		})

		it('applies correct animate state', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveAttribute('data-animate', '{"opacity":1}')
		})

		it('applies correct exit animation state', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const motionDiv = screen.getByTestId('motion-div')
			expect(motionDiv).toHaveAttribute('data-exit', '{"opacity":0}')
		})
	})

	describe('Video Loading States', () => {
		it('handles video loading attributes correctly', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const video = document.querySelector('video') as HTMLVideoElement
			expect(video).toHaveAttribute('autoplay')
			expect(video).toHaveAttribute('loop')
		})


		it('sets proper video source', () => {
			render(<AiLoading loading={true} text="Loading..." />)

			const video = document.querySelector('video') as HTMLVideoElement
			const source = video.querySelector('source')
			expect(source).toHaveAttribute('src', '/letraz-brain.webm')
			expect(source).toHaveAttribute('type', 'video/webm')
		})
	})
})
