'use client'

import {cn} from '@/lib/utils'
import routes, {Route} from '@/routes'
import {useSelectedLayoutSegment} from 'next/navigation'
import {Link} from 'next-view-transitions'
import {motion} from 'motion/react'
import {Sheet, SheetContent, SheetTrigger, SheetTitle} from '@/components/ui/sheet'
import {Menu} from 'lucide-react'
import {useState, useEffect} from 'react'

const WebsiteNavBar = ({className}: {className?: string}) => {
	const currentSegment = useSelectedLayoutSegment()
	const [mounted, setMounted] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const links: Route[] = Object.keys(routes.website).filter(route => routes.website[route].mainNav).map((route) => routes.website[route])

	const currentRoute = Object.values(routes.website).find(route => route.segment === currentSegment)
	const shouldShowHamburger = !currentRoute?.mainNav

	useEffect(() => {
		setMounted(true)
	}, [])

	const NavLinks = ({mobile = false}: {mobile?: boolean}) => (
		<>
			{links.map((link) => (
				<div key={link.route} className={cn('relative', mobile && 'w-full')}>
					{currentSegment && currentSegment === link.segment && (
						<motion.div
							layout
							layoutId={mobile ? undefined : '123'}
							className={cn(
								'absolute bg-flame-500',
								mobile ? 'w-1 h-full left-0 top-0' : 'w-full h-4 rounded-b-[50%] -top-2'
							)}
						/>
					)}
					<Link href={link.route} onClick={() => mobile && setIsOpen(false)}>
						<p className={cn(
							'font-medium opacity-70 transition hover:opacity-100 focus-visible:opacity-100',
							!mobile && 'mt-4',
							currentSegment && currentSegment === link.segment && 'opacity-100',
							mobile && 'text-lg py-4 pl-4'
						)}>
							{link.title}
						</p>
					</Link>
				</div>
			))}
		</>
	)

	return (
		<div className={className}>
			{/* Desktop Navigation */}
			<div className="hidden lg:flex gap-12">
				<NavLinks />
			</div>

			{/* Mobile Navigation */}
			{shouldShowHamburger && mounted && (
				<div className="lg:hidden flex items-center h-full mt-6">
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger className="group">
							<div className={cn(
								'p-2.5 rounded-xl transition-all duration-200',
								'bg-white/70 backdrop-blur-md shadow-sm',
								'active:bg-white/90',
								'focus-visible:ring-2 focus-visible:ring-flame-500/20 focus-visible:outline-none',
								isOpen && 'bg-white shadow-md'
							)}>
								<Menu className={cn(
									'w-5 h-5 transition-colors duration-200',
									'text-neutral-800'
								)} />
							</div>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white/95 backdrop-blur-xl border-l border-neutral-200">
							<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
							<nav className="flex flex-col mt-12">
								<NavLinks mobile />
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			)}
		</div>
	)
}

export default WebsiteNavBar
