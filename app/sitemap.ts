import {MetadataRoute} from 'next'

const sitemap = (): MetadataRoute.Sitemap => [
	{
		url: 'https://letraz.app',
		lastModified: new Date(),
		changeFrequency: 'weekly',
		priority: 1
	}
	/*
	 * {
	 * 	url: 'https://letraz.app/signin',
	 * 	lastModified: new Date(),
	 * 	changeFrequency: 'monthly',
	 * 	priority: 0.8,
	 * }
	 */
]

export default sitemap
