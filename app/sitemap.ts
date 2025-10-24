import {MetadataRoute} from 'next'
import {defaultUrl} from '@/config'
import {getBlogPosts, getAllDocumentationPages} from '@/lib/basehub'

/**
 * Dynamic sitemap that includes:
 * - Static pages
 * - All published blog posts from BaseHub
 * - All published documentation pages from BaseHub
 *
 * Revalidates every hour to stay in sync with BaseHub content
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
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

	// Blog listing page
	const blogListingPage: MetadataRoute.Sitemap = [
		{
			url: `${defaultUrl}/blog`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.9
		}
	]

	// Fetch all published blog posts
	let blogPages: MetadataRoute.Sitemap = []
	try {
		const {posts} = await getBlogPosts({limit: 1000})
		blogPages = posts.map(post => ({
			url: `${defaultUrl}/blog/${post.slug}`,
			lastModified: new Date(post.publishedAt),
			changeFrequency: 'weekly' as const,
			priority: 0.9
		}))
	} catch (error) {
		// Silent fail - return empty array for blog pages if fetch fails
		blogPages = []
	}

	// Fetch all published documentation pages
	let docPages: MetadataRoute.Sitemap = []
	try {
		const docs = await getAllDocumentationPages()
		docPages = docs.map(doc => ({
			url: `${defaultUrl}/docs/${doc.slug}`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.9
		}))
	} catch (error) {
		// Silent fail - return empty array for doc pages if fetch fails
		docPages = []
	}

	// Combine all pages
	return [...staticPages, ...blogListingPage, ...blogPages, ...docPages]
}

export default sitemap

// Revalidate every hour to stay in sync with BaseHub
export const revalidate = 3600
