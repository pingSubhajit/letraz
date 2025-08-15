'use client'

import {JSX, useMemo} from 'react'
import {motion} from 'motion/react'

interface ElegantParticlesBurstProps {
  /** Stable seed helps keep particles consistent between modes */
  playKey?: string | number
  className?: string
  /**
   * hidden: particles are invisible
   * float: particles gently drift around
   * burst: particles fly outward and fade from their current positions
   */
  mode?: 'hidden' | 'float' | 'burst'
}

type Particle = {
  id: string
  angleDeg: number
  floatDistance: number
  burstDistance: number
  size: number
  floatJitterX: number
  floatJitterY: number
  floatDuration: number
  delay: number // initial stagger
  colorClass: string
}

// Cohesive warm brand palette used across the app
const COLOR_CLASSES = [
	'bg-flame-500',
	'bg-flame-400',
	'bg-orange-500',
	'bg-amber-500',
	'bg-amber-400',
	'bg-rose-400'
]

const seededRandom = (seed: string) => {
	let h = 2166136261 >>> 0
	for (let i = 0; i < seed.length; i += 1) {
		h ^= seed.charCodeAt(i)
		h = Math.imul(h, 16777619)
	}
	return () => {
		h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5
		return (h >>> 0) / 4294967296
	}
}

const generateParticles = (seed: string | number | undefined, count: number): Particle[] => {
	const rng = seededRandom(typeof seed === 'undefined' ? Date.now().toString() : String(seed))
	const particles: Particle[] = []

	const step = 360 / count
	const jitterSpan = step * 0.6 // keep decent separation while adding organic variation

	for (let i = 0; i < count; i += 1) {
		const base = i * step
		const jitter = (rng() - 0.5) * jitterSpan
		const angleDeg = base + jitter
		// Small radius while floating, larger for the burst
		const floatDistance = 40 + rng() * 70 // px: 40–110
		const burstDistance = 220 + rng() * 240 // px: 220–460
		const size = 5 + rng() * 7 // px: 5–12
		const floatJitterX = 4 + rng() * 8 // px drift around base
		const floatJitterY = 4 + rng() * 8 // px drift around base
		const floatDuration = 2.4 + rng() * 1.6 // slower, relaxing
		const delay = rng() * 0.25 // slightly staggered appearance
		const colorClass = COLOR_CLASSES[Math.floor(rng() * COLOR_CLASSES.length)]
		particles.push({
			id: `${i}-${angleDeg.toFixed(2)}`,
			angleDeg,
			floatDistance,
			burstDistance,
			size,
			floatJitterX,
			floatJitterY,
			floatDuration,
			delay,
			colorClass
		})
	}

	return particles
}

const ParticleBurst = ({playKey, className, mode = 'hidden'}: ElegantParticlesBurstProps): JSX.Element => {
	const particles = useMemo(() => generateParticles(playKey, 18), [playKey])

	return (
		<div className={`pointer-events-none absolute inset-0 ${className ?? ''}`}>
			{particles.map((p) => {
				const radians = (p.angleDeg * Math.PI) / 180
				const floatX = Math.cos(radians) * p.floatDistance * 1.9
				const floatY = Math.sin(radians) * p.floatDistance * 1.0
				const burstX = Math.cos(radians) * p.burstDistance
				const burstY = Math.sin(radians) * p.burstDistance

				// Mode-based targets and transitions
				const isHidden = mode === 'hidden'
				const isFloat = mode === 'float'
				const isBurst = mode === 'burst'

				const animateProps = isHidden
					? {opacity: 0, scale: 0, x: 0, y: 0}
					: isFloat
						? {
							opacity: 1,
							scale: 1,
							// Gentle drift around a base point using keyframes
							x: [floatX - p.floatJitterX * 1.9, floatX + p.floatJitterX * 1.9],
							y: [floatY - p.floatJitterY * 0.9, floatY + p.floatJitterY * 0.9]
						}
						: {
							// Burst outward and fade
							opacity: 0,
							scale: 0.8,
							x: burstX,
							y: burstY
						}

				const transitionProps = isHidden
					? {duration: 0.2}
					: isFloat
						? {
							duration: p.floatDuration,
							ease: 'easeInOut' as const,
							repeat: Infinity,
							repeatType: 'mirror' as const,
							delay: p.delay
						}
						: {
							duration: 0.9,
							ease: 'easeOut' as const,
							delay: p.delay * 0.4
						}

				return (
					<motion.span
						key={p.id}
						className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow ${p.colorClass}`}
						style={{width: p.size, height: p.size, willChange: 'transform, opacity'}}
						initial={{opacity: 0, scale: 0}}
						animate={{
							...animateProps,
							// Slight emphasis on burst scale
							...(isBurst ? {scale: 1.1} : {})
						}}
						transition={transitionProps}
					/>
				)
			})}
		</div>
	)
}

export default ParticleBurst
