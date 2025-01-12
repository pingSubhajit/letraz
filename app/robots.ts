import type {MetadataRoute} from 'next'

export default (): MetadataRoute.Robots => ({
	rules: {
		userAgent: '*',
		allow: '/',
		disallow: '/app/'
	},
	sitemap: 'https://letraz.app/sitemap.xml'
})
