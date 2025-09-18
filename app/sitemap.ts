import {MetadataRoute} from 'next'
import {defaultUrl} from '@/config'

const sitemap = (): MetadataRoute.Sitemap => [
	{
		url: defaultUrl,
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 1
	},
	{
		url: `${defaultUrl}/story`,
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 1
	},
	{
		url: `${defaultUrl}/changes`,
		lastModified: new Date(),
		changeFrequency: 'monthly',
		priority: 1
	},
	{
		url: `${defaultUrl}/terms`,
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.8
	},
	{
		url: `${defaultUrl}/privacy`,
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.8
	},
	{
		url: `${defaultUrl}/signin`,
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.5
	},
	{
		url: `${defaultUrl}/signup`,
		lastModified: new Date(),
		changeFrequency: 'yearly',
		priority: 0.5
	}
]

export default sitemap
