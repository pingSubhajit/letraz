import {ReactNode} from 'react'
import WebsiteNavBar from '@/components/WebsiteNavBar'

interface AuthLayoutProps {
	children: ReactNode
}

const AuthLayout = ({children}: AuthLayoutProps) => {
	return (
		<>
			<WebsiteNavBar className="absolute top-0 left-0 w-full z-50" />

			<div className="h-screen overflow-hidden flex justify-center lg:justify-end items-center w-screen">
			<div className="absolute inset-0 overflow-hidden -z-10">
				<video autoPlay muted loop className="aspect-video absolute -z-10 w-full h-full scale-125 lg:scale-150 blur-md">
					<source src="/brain-pulse.webm" type="video/webm"/>
				</video>
			</div>
			<div className="w-full max-w-lg lg:w-[50vw] lg:max-w-none h-screen sm:h-auto sm:max-h-[90vh] sm:rounded-3xl lg:h-screen lg:max-h-none lg:rounded-none bg-neutral-50 flex flex-col justify-center items-start shadow-2xl p-6 sm:p-8 md:p-12 lg:p-24 xl:p-28 2xl:p-48">
				{children}
			</div>
		</div>
		</>
	)
}

export default AuthLayout
