import {ReactNode} from 'react'

interface AuthLayoutProps {
	children: ReactNode
}

const AuthLayout = ({children}: AuthLayoutProps) => {
	return (
		<div className="h-screen overflow-hidden flex justify-end items-center w-screen">
			<div className="absolute inset-0 overflow-hidden -z-10">
				<video autoPlay muted loop className="aspect-video absolute -z-10 w-full h-full scale-150 blur-md">
					<source src="/brain-pulse.webm" type="video/webm"/>
				</video>
			</div>
			<div className="w-[50vw] h-screen bg-neutral-50 flex flex-col justify-center items-start shadow-2xl p-48">
				{children}
			</div>
		</div>
	)
}

export default AuthLayout
