'use client'

import {JSX, useMemo} from 'react'
import {AnimatePresence, motion} from 'motion/react'

interface ElegantParticlesBurstProps {
  /** If you need to re-trigger the burst while mounted, change this key */
  playKey?: string | number
  className?: string
}

type Particle = {
  id: string
  angleDeg: number
  distance: number
  size: number
  duration: number
  delay: number
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

	for (let i = 0; i < count; i += 1) {
		const angleDeg = rng() * 360
		// Increase travel radius so particles are more spread apart
		const distance = 90 + rng() * 150 // px: 90–240
		const size = 4 + rng() * 6 // px
		const duration = 0.45 + rng() * 0.4
		const delay = rng() * 0.08
		const colorClass = COLOR_CLASSES[Math.floor(rng() * COLOR_CLASSES.length)]
		particles.push({id: `${i}-${angleDeg.toFixed(2)}`, angleDeg, distance, size, duration, delay, colorClass})
	}

	return particles
}

const ParticleBurst = ({playKey, className}: ElegantParticlesBurstProps): JSX.Element => {
	const particles = useMemo(() => generateParticles(playKey, 18), [playKey])

	return (
		<div className={`pointer-events-none absolute inset-0 ${className ?? ''}`}>
			<AnimatePresence>
				{particles.map((p) => {
					const radians = (p.angleDeg * Math.PI) / 180
					const x = Math.cos(radians) * p.distance
					const y = Math.sin(radians) * p.distance
					return (
						<motion.span
							key={p.id}
							className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow ${p.colorClass}`}
							style={{width: p.size, height: p.size}}
							initial={{opacity: 0, scale: 0}}
							animate={{opacity: 1, scale: 1, x, y}}
							exit={{opacity: 0, scale: 0.6}}
							transition={{type: 'spring', duration: p.duration, bounce: 0.3, delay: p.delay}}
						/>
					)
				})}
			</AnimatePresence>
		</div>
	)
}

export default ParticleBurst
