'use client'

import {AnimatePresence} from 'motion/react'
import {cn} from '@/lib/utils'
import {SiDiscord, SiGithub, SiX} from 'react-icons/si'
import {Button} from '@/components/ui/button'
import {discordHandle, githubHandle, twitterHandle} from '@/config'
import {Link} from 'next-view-transitions'

const LandingPageFooter = ({className}: {className?: string}) => {
	return (
		<AnimatePresence>
			<div className={cn('w-full flex items-center justify-between', className)}>
				<Link href="/changes">
					<Button variant="link" className="pl-0 text-flame-500 font-semibold">Development updates</Button>
				</Link>

				<div className="flex items-center gap-5">
					<a href={discordHandle} target="_blank" aria-label="Discord community" rel="noopener noreferrer">
						<Button asChild variant="ghost" size="icon" className="w-min h-min opacity-80 focus-visible:opacity-100 hover:opacity-100">
							<SiDiscord className="w-4 h-4"/>
						</Button>
					</a>

					<a href={twitterHandle} target="_blank" aria-label="X (Twitter) handle" rel="noopener noreferrer">
						<Button asChild variant="ghost" size="icon" className="w-min h-min opacity-80 focus-visible:opacity-100 hover:opacity-100">
							<SiX className="w-4 h-4"/>
						</Button>
					</a>

					<a href={githubHandle} target="_blank" aria-label="Github page" rel="noopener noreferrer">
						<Button asChild variant="ghost" size="icon" className="w-min h-min opacity-80 focus-visible:opacity-100 hover:opacity-100">
							<SiGithub className="w-4 h-4"/>
						</Button>
					</a>
				</div>
			</div>
		</AnimatePresence>
	)
}

export default LandingPageFooter
