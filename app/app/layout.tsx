import {ReactNode} from 'react'
import AppSidebar from '@/components/AppSidebar'

const AppLayout = ({ children }: {children: ReactNode}) => {
	return (
		<div className="min-h-svh flex items-stretch relative">
			<div className="bg-gradient-to-b from-orange-600 via-amber-500 to-rose-600 h-full w-1 absolute top-0 left-0 -z-10" />
			<AppSidebar />
			<div className="h-[674px] w-[118px] absolute bg-rose-500 rounded-[50%] -z-10 -top-48 blur-[150px] -left-64" />
			<div className="h-[669px] w-[228px] absolute bg-orange-600 rounded-[50%] -z-10 top-[25%] blur-[150px] -left-80" />
			<div className="h-[709px] w-[176px] absolute bg-amber-300 rounded-[50%] -z-10 -bottom-36 blur-[150px] -left-72" />
			<main className="w-full p-8">
				{children}
			</main>
		</div>
	)
}

export default AppLayout
