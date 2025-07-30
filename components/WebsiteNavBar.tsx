'use client'

import {cn} from '@/lib/utils'
import routes, {Route} from '@/routes'
import {useSelectedLayoutSegment} from 'next/navigation'
import {Link} from 'next-view-transitions'
import {AnimatePresence, motion} from 'motion/react'
import {useId, useState} from 'react'
import {Button} from '@/components/ui/button'
import LandingPageLogo from '@/app/(website)/page.logo'
import useDOMMounted from '@/hooks/useDOMMounted'
import {MenuIcon} from '@/components/ui/menu'
import NavMenuBg from '@/public/nav_menu_bg.png'
import Image from 'next/image'

const WebsiteNavBar = ({className}: {className?: string}) => {
	const currentSegment = useSelectedLayoutSegment()
	const [isOpen, setIsOpen] = useState(false)
	const links: Route[] = Object.keys(routes.website).filter(route => routes.website[route].mainNav).map((route) => routes.website[route])

	const mounted = useDOMMounted()
	const indicatorId = useId()

	const NavLinks = ({mobile = false}: {mobile?: boolean}) => {
		return (
			<>
				{links.map((link, index) => (
					<div key={link.route} className="relative">
						{!mobile && <div>
							{/* Current Route Indicator */}
							{currentSegment && currentSegment === link.segment && (
								<motion.div
									layout layoutId={indicatorId}
									className={cn(
										'absolute bg-flame-500',
										mobile ? 'w-1 h-full left-0 top-0' : 'w-full h-4 rounded-b-full -top-2'
									)}
								/>
							)}

							{/* Link Text */}
							<Link href={link.route} onClick={() => mobile && setIsOpen(false)}>
								<p className={cn(
									'font-semibold opacity-70 transition hover:opacity-100 focus-visible:opacity-100 mt-3',
									currentSegment && currentSegment === link.segment && 'opacity-100'
								)}>
									{link.title}
								</p>
							</Link>
						</div>}

						{mobile && <div className="mt-4">
							{/* Link Text */}
							<motion.div
								initial={{y: 35, opacity: 0}}
								animate={{y: 0, opacity: 1}}
								transition={{duration: 0.5, delay: index * 0.1, ease: 'easeInOut'}}
							>
								<Link href={link.route} onClick={() => mobile && setIsOpen(false)}>
									<p className={cn(
										'font-semibold opacity-70 transition hover:opacity-100 focus-visible:opacity-100 mt-4 text-3xl flex items-center gap-4',
										currentSegment && currentSegment === link.segment && 'opacity-100'
									)}>
										<span className="w-2 h-2 rounded-full bg-flame-500" />
										{link.title}
									</p>
								</Link>
							</motion.div>
						</div>}
					</div>
				))}
			</>
		)
	}

	return (
		<div className={cn('relative', className)}>
			{/* Desktop Navigation */}
			<div className="hidden lg:flex gap-12 justify-end">
				<NavLinks />
			</div>

			{/* Mobile Navigation */}
			{mounted && (
				<>
					<div className="lg:hidden flex items-center h-full mt-6 w-full justify-between bg-white shadow rounded-full pr-2 pl-6 py-1.5 z-50 relative">
						<div onClick={() => setIsOpen(false)}>
							<LandingPageLogo className="mb-1" />
						</div>

						<Button
							className={cn(
								'p-2 rounded-full transition-all duration-200',
								'bg-neutral-100 backdrop-blur-md shadow-sm',
								'active:bg-neutral-200 hover:bg-neutral-200',
								'focus-visible:ring-2 focus-visible:ring-flame-500/20 focus-visible:outline-none',
								isOpen && 'bg-neutral-100 shadow-md'
							)}
							size="sm"
							onClick={() => setIsOpen(!isOpen)}
						>
							<MenuIcon className="[&>svg]:stroke-primary" openState={isOpen} />
						</Button>
					</div>

					<AnimatePresence>
						{isOpen && <motion.div
							className="absolute lg:hidden w-screen h-dvh top-0 -left-7 bg-white z-40 pt-32 px-8 flex flex-col gap-8"
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							exit={{opacity: 0}}
							transition={{duration: 0.2}}
						>
							<NavLinks mobile={true} />

							{/* Background Image */}
							<Image
								priority={true}
								src={NavMenuBg}
								alt="Background Image"
								className="absolute bottom-0 left-0 w-full"
							/>
						</motion.div>}
					</AnimatePresence>
				</>
			)}
		</div>
	)
}

export default WebsiteNavBar
