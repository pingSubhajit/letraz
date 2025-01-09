import {ReactNode} from 'react'
import WebsiteNavBar from '@/components/WebsiteNavBar'

const WebsiteLayout = ({children}: {children: ReactNode}) => {
	return (
		<div className="relative">
			<WebsiteNavBar className="fixed top-0 right-7 lg:right-16 z-30 w-[calc(100vw-56px)] lg:w-[calc9100vw-128px)]" />
			{children}
		</div>
	)
}

export default WebsiteLayout
