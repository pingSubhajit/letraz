export type NotificationSender = {
	name: string
	avatar: string
}

export const senders: Record<string, NotificationSender> = {
	'default': {
		name: 'Letraz',
		avatar: '/letraz.png'
	},
	'from-subhajit': {
		name: 'Subhajit Kundu',
		avatar: '/subhajit.png'
	}
}
