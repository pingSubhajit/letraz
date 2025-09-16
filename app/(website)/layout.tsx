import {ReactNode} from 'react'
import WebsiteNavBar from '@/components/WebsiteNavBar'
import AcquisitionTracker from '@/components/analytics/AcquisitionTracker'

const WebsiteLayout = ({children}: {children: ReactNode}) => {
	return (
		<div className="relative">
			<WebsiteNavBar className="fixed top-0 left-1/2 -translate-x-1/2 lg:right-16 z-30 w-screen" />
			<AcquisitionTracker />
			{children}
		</div>
	)
}

export default WebsiteLayout
