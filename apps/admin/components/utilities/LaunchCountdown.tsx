'use client'

import {useEffect, useMemo, useState} from 'react'

type TimeParts = {
	days: number
	hours: number
	minutes: number
	seconds: number
}

const getTargetDate = (now: Date): Date => {
	/*
	 * Compute 12:00 PM IST on November 1st relative to current year.
	 * IST is UTC+5:30. We construct the target in UTC to avoid DST issues.
	 */
	const year = now.getUTCFullYear()
	const targetUtc = new Date(Date.UTC(year, 10 /* Nov */, 1, 6, 30, 0))
	// If current time in UTC is past targetUtc, roll to next year
	if (now.getTime() >= targetUtc.getTime()) {
		return new Date(Date.UTC(year + 1, 10, 1, 6, 30, 0))
	}
	return targetUtc
}

const msToParts = (ms: number): TimeParts => {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000))
	const days = Math.floor(totalSeconds / (24 * 3600))
	const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	return {days, hours, minutes, seconds}
}

const pad2 = (n: number) => n.toString().padStart(2, '0')

const LaunchCountdown = () => {
	const [now, setNow] = useState<Date>(() => new Date())
	const target = useMemo(() => getTargetDate(new Date()), [])

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(id)
	}, [])

	const remainingMs = Math.max(0, target.getTime() - now.getTime())
	const {days, hours, minutes, seconds} = msToParts(remainingMs)

	return (
		<div className="flex flex-col items-center gap-4 md:gap-8 text-center">
			<div className="grid grid-flow-col gap-3 sm:gap-4 md:gap-6 text-center auto-cols-max">
				<div className="flex flex-col p-2 sm:p-3 bg-black/5 dark:bg-white/10 rounded-2xl">
					<span className="countdown font-mono text-2xl sm:text-3xl md:text-9xl tabular-nums">{days}</span>
					<span className="text-xs opacity-70">days</span>
				</div>
				<div className="flex flex-col p-2 sm:p-3 bg-black/5 dark:bg-white/10 rounded-2xl">
					<span className="countdown font-mono text-2xl sm:text-3xl md:text-9xl tabular-nums">{pad2(hours)}</span>
					<span className="text-xs opacity-70">hours</span>
				</div>
				<div className="flex flex-col p-2 sm:p-3 bg-black/5 dark:bg-white/10 rounded-2xl">
					<span className="countdown font-mono text-2xl sm:text-3xl md:text-9xl tabular-nums">{pad2(minutes)}</span>
					<span className="text-xs opacity-70">minutes</span>
				</div>
				<div className="flex flex-col p-2 sm:p-3 bg-black/5 dark:bg-white/10 rounded-2xl">
					<span className="countdown font-mono text-2xl sm:text-3xl md:text-9xl tabular-nums">{pad2(seconds)}</span>
					<span className="text-xs opacity-70">seconds</span>
				</div>
			</div>
			<div className="text-xs opacity-70">Target: 12:00 PM, Nov 1 (IST)</div>
		</div>
	)
}

export default LaunchCountdown


