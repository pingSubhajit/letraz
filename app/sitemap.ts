import {MetadataRoute} from 'next'

const sitemap = (): MetadataRoute.Sitemap => [
	{
		url: 'https://letraz.app',
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 1
	},
	{
		url: 'https://letraz.app/story',
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 1
	},
	{
		url: 'https://letraz.app/changes',
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 1
	}
]

export default sitemap
