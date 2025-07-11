'use client'

import {ReactNode} from 'react'
import {motion} from 'motion/react'
import AppSidebar from '@/components/AppSidebar'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'

const AppLayoutContainer = ({children}: {children: ReactNode}) => {
	return (
		<div className="h-svh flex items-stretch relative overflow-hidden scrollbar-thin">
			{/* SIDEBAR */}
			<AppSidebar />

			{/* SIDEBAR GRADIENT SHADOWS */}
			<div className="h-[674px] w-[118px] absolute bg-rose-500 rounded-[50%] -z-10 -top-48 blur-[150px] -left-64" />
			<div className="h-[669px] w-[228px] absolute bg-flame-500 rounded-[50%] -z-10 top-[25%] blur-[150px] -left-80" />
			<div className="h-[709px] w-[176px] absolute bg-amber-300 rounded-[50%] -z-10 -bottom-36 blur-[150px] -left-72" />

			{/* MAIN CONTENT */}
			<motion.div className="flex-shrink-0 w-[calc(100vw-80px)] h-screen">
				<SmoothScrollProvider className="overflow-y-auto overflow-x-hidden h-screen w-full">
					<main>
						{children}
					</main>
				</SmoothScrollProvider>
			</motion.div>
		</div>
	)
}

export default AppLayoutContainer
