import {ReactNode} from 'react'
import WebsiteNavBar from '@/components/WebsiteNavBar'

const WebsiteLayout = ({children}: {children: ReactNode}) => {
	return (
		<div className="relative">
			<WebsiteNavBar className="fixed top-0 right-16 z-30" />
			{children}
		</div>
	)
}

export default WebsiteLayout
