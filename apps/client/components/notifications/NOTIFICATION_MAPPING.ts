export type NotificationSender = {
	name: string
	avatar: string
}

export const SENDER_KEYS = {
	DEFAULT: 'default',
	FROM_SUBHAJIT: 'from-subhajit'
} as const

export const senders: Record<string, NotificationSender> = {
	[SENDER_KEYS.DEFAULT]: {
		name: 'Letraz',
		avatar: '/letraz.png'
	},
	[SENDER_KEYS.FROM_SUBHAJIT]: {
		name: 'Subhajit Kundu',
		avatar: '/subhajit.png'
	}
}
