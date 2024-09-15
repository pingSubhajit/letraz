import {MetadataRoute} from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://letraz.app',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		// {
		// 	url: 'https://letraz.app/signin',
		// 	lastModified: new Date(),
		// 	changeFrequency: 'monthly',
		// 	priority: 0.8,
		// }
	]
}
