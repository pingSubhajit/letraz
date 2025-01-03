'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {cn} from '@/lib/utils'
import {SiDiscord, SiGithub, SiX} from 'react-icons/si'
import {Button} from '@/components/ui/button'
import {discordHandle, githubHandle, twitterHandle} from '@/constants'
import {Link} from 'next-view-transitions'

const LandingPageFooter = ({className}: {className?: string}) => {
	return (
		<AnimatePresence>
			<motion.div
				className={cn('w-full flex flex-row-reverse items-center justify-between', className)}
				{...({} as any)}
				// Framer-motion types are broken as of 22/10/2024
				initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.7}}
			>
				<div className="flex items-center gap-5">
					<a href={discordHandle} target="_blank">
						<Button variant="ghost" size="icon" className="w-min h-min opacity-80 focus-visible:opacity-100 hover:opacity-100">
							<SiDiscord className="w-4 h-4"/>
						</Button>
					</a>

					<a href={twitterHandle} target="_blank">
						<Button variant="ghost" size="icon" className="w-min h-min opacity-80 focus-visible:opacity-100 hover:opacity-100">
							<SiX className="w-4 h-4"/>
						</Button>
					</a>

					<a href={githubHandle} target="_blank">
						<Button variant="ghost" size="icon" className="w-min h-min opacity-80 focus-visible:opacity-100 hover:opacity-100">
							<SiGithub className="w-4 h-4"/>
						</Button>
					</a>
				</div>

				<Link href="/changes">
					<Button variant="link" className="text-flame-500 font-semibold">Development updates</Button>
				</Link>
			</motion.div>
		</AnimatePresence>
	)
}

export default LandingPageFooter