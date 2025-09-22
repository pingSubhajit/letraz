import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getBlogCategories, getBlogPosts, getFeaturedBlogPosts} from '@/lib/basehub'
import {BlogPostCard} from '@/components/blog/BlogPostCard'
import {BlogCategories} from '@/components/blog/BlogCategories'

export const metadata: Metadata = {
	title: 'Blog',
	description: 'Insights, updates, and stories from the Letraz team. Stay up to date with the latest in AI-powered resume building and career development.',
	openGraph: {
		title: 'Blog | Letraz',
		description: 'Insights, updates, and stories from the Letraz team.',
		url: '/blog',
		type: 'website'
	}
}

interface BlogPageProps {
	searchParams: Promise<{
		category?: string
		page?: string
	}>
}

const BlogPage = async ({searchParams}: BlogPageProps) => {
	const {category, page: pageParam} = await searchParams
	const page = parseInt(pageParam || '1')
	const postsPerPage = 50
	const offset = (page - 1) * postsPerPage

	try {
		// Fetch data in parallel
		const [postsData, categories, featuredPosts] = await Promise.all([
			getBlogPosts({
				limit: postsPerPage,
				offset,
				category
			}),
			getBlogCategories(),
			page === 1 ? getFeaturedBlogPosts(2) : []
		])

		const {posts} = postsData

		if (posts.length === 0) {
			notFound()
		}

		return (
			<div className="min-h-screen pt-32">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					{page === 1 && featuredPosts.length > 0 && (
						<section className="">
							{/* Hero Header */}
							<div className="mb-8">
								<h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-6">
									Our blog
								</h1>
								<p className="text-xl text-neutral-600 max-w-2xl">
									Insights, updates, and stories directly from the Letraz team.
								</p>
							</div>

							{/* Categories Filter */}
							{categories.length > 0 && (
								<BlogCategories
									categories={categories}
									selectedCategory={category}
								/>
							)}

							{/* Featured Posts Grid: Two equal big cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
								{featuredPosts.map((post) => (
									<BlogPostCard key={post._id} post={post} featured={true} />
								))}
							</div>
						</section>
					)}

					{/* Page Header */}
					<div className="mt-24">
						<h1 className="text-2xl font-bold text-neutral-900 mb-4">
							{category ? `${category} Posts` : 'All Posts'}
						</h1>
					</div>

					{/* Blog Posts Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-16">
						{posts.map((post) => (
							<BlogPostCard key={post._id} post={post} />
						))}
					</div>
				</div>
			</div>
		)
	} catch (error) {
		notFound()
	}
}

export default BlogPage
