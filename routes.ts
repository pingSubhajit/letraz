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
		},
		privacy: {
			title: 'Privacy',
			segment: 'privacy',
			route: '/privacy',
			mainNav: false
		},
		terms: {
			title: 'Terms',
			segment: 'terms',
			route: '/terms',
			mainNav: false
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
