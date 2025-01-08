'use client'

import {cn} from '@/lib/utils'
import routes, {Route} from '@/routes'
import {useSelectedLayoutSegment} from 'next/navigation'
import {Link} from 'next-view-transitions'
import {motion} from 'motion/react'

const WebsiteNavBar = ({className}: {className?: string}) => {
	const currentSegment = useSelectedLayoutSegment()
	const links: Route[] = Object.keys(routes.website).filter(route => routes.website[route].mainNav).map((route) => routes.website[route])

	return (
		<div className={cn('flex gap-12', className)}>
			{links.map((link) => (
				<div key={link.route} className="relative">
					{currentSegment && currentSegment === link.segment && <motion.div layout layoutId={'123'} className="absolute w-full h-4 bg-flame-500 rounded-b-[50%] -top-2" />}
					<Link href={link.route}><p className={cn('mt-4 font-medium opacity-70 transition hover:opacity-100 focus-visible:opacity-100', currentSegment && currentSegment === link.segment && 'opacity-100')}>{link.title}</p></Link>
				</div>
			))}
		</div>
	)
}

export default WebsiteNavBar
