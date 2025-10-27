'use client'

import {useEffect, useRef, useState} from 'react'

/**
 * useRevealOnReady toggles a boolean to true when a loading->ready transition occurs.
 * - Initially returns false.
 * - When `isReady` becomes true after not being ready, it returns true for one animation cycle.
 */
export const useRevealOnReady = (isReady: boolean, options?: {autoResetMs?: number}) => {
	const {autoResetMs = 4500} = options || {}
	const [reveal, setReveal] = useState(false)
	const wasReadyRef = useRef(false)

	useEffect(() => {
		if (isReady && !wasReadyRef.current) {
			setReveal(true)
			wasReadyRef.current = true
			const t = window.setTimeout(() => setReveal(false), autoResetMs)
			return () => window.clearTimeout(t)
		}
		if (!isReady) {
			// Allow retrigger if data becomes not-ready again
			wasReadyRef.current = false
		}
	}, [isReady, autoResetMs])

	return reveal
}

export default useRevealOnReady


