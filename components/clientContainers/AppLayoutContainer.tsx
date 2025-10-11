'use client'

import {ReactNode} from 'react'
import {motion} from 'motion/react'
import AppSidebar from '@/components/AppSidebar'
import MobileNavbar from '@/components/MobileNavbar'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'

const AppLayoutContainer = ({children}: {children: ReactNode}) => {
	return (
		<div className="h-svh flex items-stretch relative overflow-hidden scrollbar-thin">
			{/* MOBILE NAVBAR - Only visible on mobile */}
			<MobileNavbar />

			{/* SIDEBAR - Only visible on desktop */}
			<AppSidebar />

			{/* SIDEBAR GRADIENT SHADOWS - Only visible on desktop */}
			<div className="hidden md:block h-[674px] w-[118px] absolute bg-rose-500 rounded-[50%] -z-10 -top-48 blur-[150px] -left-64" />
			<div className="hidden md:block h-[669px] w-[228px] absolute bg-flame-500 rounded-[50%] -z-10 top-[25%] blur-[150px] -left-80" />
			<div className="hidden md:block h-[709px] w-[176px] absolute bg-amber-300 rounded-[50%] -z-10 -bottom-36 blur-[150px] -left-72" />

			{/* MAIN CONTENT */}
			<motion.div className="flex-shrink-0 w-full md:w-[calc(100vw-80px)] h-screen md:h-screen pt-14 md:pt-0">
				<SmoothScrollProvider className="overflow-y-auto overflow-x-hidden h-full w-full">
					<main>
						{children}
					</main>
				</SmoothScrollProvider>
			</motion.div>
		</div>
	)
}

export default AppLayoutContainer
