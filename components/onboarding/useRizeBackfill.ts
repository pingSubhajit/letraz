'use client'

import {useCallback, useEffect, useRef, useState} from 'react'

type Status = 'idle' | 'pending' | 'complete' | 'error'

export const useRizeBackfill = () => {
	const [status, setStatus] = useState<Status>('idle')
	const [rizeUserId, setRizeUserId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	const fetchStatus = useCallback(async () => {
		try {
			const res = await fetch('/api/rize/status', {cache: 'no-store'})
			if (!res.ok) throw new Error('status failed')
			const json = await res.json()
			setRizeUserId(json.rizeUserId || null)
			setStatus(json.rizeBackfill?.status || 'idle')
			setError(json.rizeBackfill?.error || null)
		} catch (e: any) {
			setError(e?.message || 'status failed')
		}
	}, [])

	useEffect(() => {
		fetchStatus()
		return () => {
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [fetchStatus])

	const startPolling = useCallback(() => {
		if (timerRef.current) return
		timerRef.current = setInterval(fetchStatus, 1500)
	}, [fetchStatus])

	const stopPolling = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const retry = useCallback(async () => {
		try {
			const res = await fetch('/api/rize/backfill', {method: 'POST'})
			if (!res.ok) throw new Error('retry failed')
			setStatus('pending')
			startPolling()
		} catch (e: any) {
			setError(e?.message || 'retry failed')
		}
	}, [startPolling])

	useEffect(() => {
		if (status === 'pending') startPolling()
		if (status === 'complete' || status === 'error' || status === 'idle') stopPolling()
	}, [status, startPolling, stopPolling])

	return {status, rizeUserId, error, fetchStatus, retry}
}
