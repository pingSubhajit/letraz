export type Route = {
	title: string,
	segment: string,
	route: string,
	mainNav?: boolean
}

const routes: Record<'website' | 'app', Record<string, Route>> = {
	website: {
		home: {
			title: 'Home',
			segment: '',
			route: '/',
			mainNav: false
		},
		story: {
			title: 'Our Story',
			segment: 'story',
			route: '/story',
			mainNav: true
		},
		changes: {
			title: 'Progress Updates',
			segment: 'changes',
			route: '/changes',
			mainNav: true
		}
	},
	app: {
		home: {
			title: 'Home',
			segment: '',
			route: '/app'
		},
		onboarding: {
			title: 'About',
			segment: 'onboarding',
			route: '/app/onboarding?step=welcome'
		}
	}
}

export default routes
