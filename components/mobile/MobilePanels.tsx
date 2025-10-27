'use client'

import {useMobilePanel} from '@/components/providers/MobilePanelProvider'
import MobilePanelSheet from '@/components/mobile/MobilePanelSheet'
import NotificationFeed from '@/components/notifications/NotificationFeed'
import UserSupportPanel from '@/components/UserSupportPanel'
import {useIsMobile} from '@/components/resume/hooks/useIsMobile'

/**
 * Container for all mobile panel sheets (notifications and support)
 * Only renders on mobile screens (< 1024px)
 * Automatically shows/hides based on MobilePanelProvider state
 */
const MobilePanels = () => {
	const {activePanel, closePanel} = useMobilePanel()
	const isMobile = useIsMobile(1024)

	// Only render on mobile
	if (!isMobile) return null

	return (
		<>
			{/* Notifications Panel */}
			<MobilePanelSheet
				isOpen={activePanel === 'notifications'}
				onClose={closePanel}
				title="Notifications"
			>
				<NotificationFeed onNotificationClick={closePanel} hideHeader={true} />
			</MobilePanelSheet>

			{/* Support Panel */}
			<MobilePanelSheet
				isOpen={activePanel === 'support'}
				onClose={closePanel}
				title="Help and support"
			>
				<UserSupportPanel hideHeader={true} />
			</MobilePanelSheet>
		</>
	)
}

export default MobilePanels
