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
	},
	{
		url: 'https://letraz.app/terms',
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.8
	},
	{
		url: 'https://letraz.app/privacy',
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.8
	},
	{
		url: 'https://letraz.app/signin',
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.5
	},
	{
		url: 'https://letraz.app/signup',
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.5
	}
]

export default sitemap
