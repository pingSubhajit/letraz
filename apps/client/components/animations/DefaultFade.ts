// Reusable fade animations for skeleton loading transitions

export const DEFAULT_FADE_ANIMATION = {
	initial: {opacity: 0},
	animate: {opacity: 1},
	exit: {opacity: 0},
	transition: {duration: 0.2, ease: 'easeInOut'}
}

export const DEFAULT_FADE_CONTENT_ANIMATION = {
	initial: {opacity: 0},
	animate: {opacity: 1},
	exit: {opacity: 0},
	transition: {duration: 0.3, delay: 0.1, ease: 'easeInOut'}
}

// For components that should render immediately without fade (e.g., during tab switches)
export const NO_ANIMATION = {
	initial: {opacity: 1},
	animate: {opacity: 1},
	exit: {opacity: 1},
	transition: {duration: 0}
}

// For AnimatePresence mode
export const ANIMATE_PRESENCE_MODE = 'wait' as const

export default DEFAULT_FADE_ANIMATION
