import type {MetadataRoute} from 'next'

const robots = (): MetadataRoute.Robots => ({
	rules: {
		userAgent: '*',
		allow: '/',
		disallow: '/app/'
	},
	sitemap: 'https://letraz.app/sitemap.xml'
})

export default robots
