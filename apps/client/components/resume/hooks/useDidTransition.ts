'use client'

import {useEffect, useRef, useState} from 'react'

/**
 * Returns true once when `value` transitions from `from` to `to`.
 */
export const useDidTransition = <T, >(value: T, from: T, to: T) => {
	const prevRef = useRef<T>(value)
	const [did, setDid] = useState(false)

	useEffect(() => {
		if (prevRef.current === from && value === to) {
			setDid(true)
		}
		prevRef.current = value
	}, [value, from, to])

	return did
}

export default useDidTransition


