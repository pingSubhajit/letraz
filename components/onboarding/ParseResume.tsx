'use client'

import {cn} from '@/lib/utils'
import {JSX, useEffect, useState} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {Button} from '@/components/ui/button'
import {FileCheck} from 'lucide-react'
import DEFAULT_FADE_ANIMATION, {ANIMATE_PRESENCE_MODE} from '@/components/animations/DefaultFade'
import ParticlesBurst from '@/components/animations/ParticlesBurst'

const ParseResume = ({className, toggleParseResume}: { className?: string, toggleParseResume?: () => void }): JSX.Element => {
	const [parsed, setParsed] = useState(false)
	const [burstKey, setBurstKey] = useState<number>(() => Date.now())

	useEffect(() => {
		if (parsed) {
			setBurstKey(Date.now())
		}
	}, [parsed])

	return (
		<div className={cn('max-w-4xl mx-auto flex flex-col items-center mt-8', className)}>
			<motion.div
				className="text-xl text-center max-w-xl"
				initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2, duration: 0.7}}
			>
				<p>We need a few details about you to craft the perfect resume for you</p>

				<div className="mt-10">
					<div className="h-64 w-full bg-neutral-100 p-2 rounded-3xl relative">
						<div className="h-full w-full bg-neutral-50 rounded-2xl flex flex-col items-center justify-center p-8">
							<div className="border-4 opacity-60 p-4 rounded-3xl">
								<FileCheck className="w-10 h-10" />
							</div>

							<p className="mt-4">Do you already have an existing resume?</p>
							<p className="text-sm mt-2 opacity-60">Upload it and we will magically understand key information about you and you won't have to enter the details manually</p>
						</div>

						<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
							{parsed && (
								<motion.div
									key="PARSED_OVERLAY"
									className="absolute inset-0 bg-neutral-50 z-10 rounded-3xl"
									initial={{opacity: 0, scale: 0.85}}
									animate={{opacity: 1, scale: 1}}
									exit={{opacity: 0, scale: 0.95}}
									transition={{type: 'spring', duration: 0.5, bounce: 0.35}}
								>
									<ParticlesBurst playKey={burstKey} />
									<div className="w-full rounded-3xl ring-fade-orange overflow-hidden flex flex-col items-center justify-center px-6 py-12">
										<p className="font-medium text-orange-500 text-xl">Wow! That worked! 🎉</p>
										<p className="mt-2 text-sm w-80  opacity-75">We've understood a lot about you from your resume. See you on the other side</p>
									</div>

									<div className="w-3/4 bg-neutral-100 mx-auto rounded-b-3xl p-4 border-x-2 border-b-2 border-neutral-300">
										<p className="text-sm">You don't need to enter your details manually anymore. On the next step we'll show you your base resume</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<AnimatePresence mode="wait">
						{!parsed && <motion.div {...DEFAULT_FADE_ANIMATION} className="mt-12" key="MANUAL_DETAILS_CTA">
							<Button onClick={toggleParseResume} variant="outline" size="lg">Enter the details manually</Button>
							<p className="text-xs mt-2 opacity-50 w-80 mx-auto text-center">We would ask for your educations and experiences on the next steps</p>
						</motion.div>}

						{parsed && <motion.div {...DEFAULT_FADE_ANIMATION} className="mt-12" key="RESUME_PARSED_CTA">
							<Button onClick={toggleParseResume} size="lg">Let's get your base resume</Button>
							<p className="text-xs mt-2 opacity-50 w-80 mx-auto text-center">Your base resume is ready, click to get started</p>
						</motion.div>}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	)
}

export default ParseResume
