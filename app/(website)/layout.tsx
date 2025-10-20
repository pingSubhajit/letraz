import {ReactNode} from 'react'
import WebsiteNavBar from '@/components/WebsiteNavBar'
import AcquisitionTracker from '@/components/analytics/AcquisitionTracker'
import WebsiteFooter from '@/components/WebsiteFooter'
import {SpeedInsights} from '@vercel/speed-insights/next'

const WebsiteLayout = ({children}: {children: ReactNode}) => {
	return (
		<div className="relative [&>*]:font-jakarta">
			<WebsiteNavBar className="fixed top-0 z-30 w-full" />

			{children}

			{/* <div className="mt-[500px] mx-auto">
				<WebsiteFooter />
			</div> */}

			<SpeedInsights />
			<AcquisitionTracker />
		</div>
	)
}

export default WebsiteLayout
