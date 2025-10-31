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
		docs: {
			title: 'Docs',
			segment: 'docs',
			route: '/docs',
			mainNav: true
		},
		story: {
			title: 'Our Story',
			segment: 'story',
			route: '/story',
			mainNav: true
		},
		changes: {
			title: 'Changelog',
			segment: 'changes',
			route: '/changes',
			mainNav: true
		},
		signin: {
			title: 'Sign in',
			segment: 'signin',
			route: '/signin',
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
