'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {PDF_DIMENSIONS} from '@/lib/constants'
import {cn} from '@/lib/utils'

type DesktopResumeScalerProps = {
  children: React.ReactNode
  className?: string
  /** Optional test id for querying in tests */
  'data-testid'?: string
}

/**
 * DesktopResumeScaler
 *
 * Scales the A4 resume proportionally for desktop screens while preserving a
 * fixed column height of 100vh. The scale is computed as:
 *   finalScale = (viewportHeight / PDF_DIMENSIONS.HEIGHT) * widthScale
 * where widthScale is 1 at a 1512px wide viewport and scales down linearly for
 * narrower widths (down to the desktop breakpoint), never scaling up beyond 1.
 *
 * Notes:
 * - The outer wrapper is always 100dvh tall to ensure consistent vertical
 *   sizing even with dynamic browser UI (mobile-safe dvh unit is supported on
 *   modern desktop browsers as well). Fallback to 100vh is not needed here as
 *   this component is desktop-only.
 * - We compute explicit pixel dimensions for the wrapper so the surrounding
 *   layout can allocate correct width for the scaled resume pane.
 */
const DesktopResumeScaler = ({children, className, 'data-testid': dataTestId}: DesktopResumeScalerProps) => {
	const calculate = useCallback(() => {
		if (typeof window === 'undefined') {
			return {
				finalScale: 1,
				widthPx: PDF_DIMENSIONS.WIDTH,
				heightPx: PDF_DIMENSIONS.HEIGHT
			}
		}

		const viewportWidth = window.innerWidth
		const viewportHeight = window.innerHeight

		// Height-based scale so that A4 height fits in 100vh
		const heightScale = viewportHeight / PDF_DIMENSIONS.HEIGHT

		// Width-based factor: 1 at 1512px, scaled down linearly for narrower widths
		const DESKTOP_BASE_WIDTH = 1512
		const DESKTOP_MIN_WIDTH = 1024 // aligns with mobile breakpoint
		const rawWidthFactor = viewportWidth / DESKTOP_BASE_WIDTH
		const minWidthFactor = DESKTOP_MIN_WIDTH / DESKTOP_BASE_WIDTH
		const widthScale = Math.min(1, Math.max(minWidthFactor, rawWidthFactor))
		const finalScale = Math.min(heightScale, widthScale)

		const widthPx = Math.round(PDF_DIMENSIONS.WIDTH * finalScale)
		const heightPx = Math.round(PDF_DIMENSIONS.HEIGHT * finalScale)

		return {finalScale, widthPx, heightPx}
	}, [])

	const [state, setState] = useState(() => calculate())

	useEffect(() => {
		const onResize = () => setState(calculate())
		onResize()
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [calculate])

	const {finalScale, widthPx} = state

	// Inline styles depend on measured viewport; memoize for stability
	const wrapperStyle = useMemo<React.CSSProperties>(() => ({
		height: '100dvh',
		width: `${widthPx}px`
	}), [widthPx])

	const innerStyle = useMemo<React.CSSProperties>(() => ({
		width: `${PDF_DIMENSIONS.WIDTH}px`,
		height: `${PDF_DIMENSIONS.HEIGHT}px`,
		transform: `scale(${finalScale})`,
		transformOrigin: 'top left'
	}), [finalScale])

	return (
		<div className={cn('relative shrink-0')} style={wrapperStyle} data-testid={dataTestId}>
			<div className={cn('absolute top-0 left-0 size-a4 max-h-screen relative', className)} style={innerStyle}>
				{children}
			</div>
		</div>
	)
}

export default DesktopResumeScaler


