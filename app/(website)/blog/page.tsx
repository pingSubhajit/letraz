import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getBlogCategories, getBlogPosts, getFeaturedBlogPosts} from '@/lib/basehub'
import {BlogPostCard} from '@/components/blog/BlogPostCard'
import {BlogHero} from '@/components/blog/BlogHero'
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
	const postsPerPage = 9
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
			page === 1 && !category ? getFeaturedBlogPosts(3) : Promise.resolve([])
		])

		const {posts, total} = postsData
		const totalPages = Math.ceil(total / postsPerPage)

		if (posts.length === 0 && page === 1) {
			return (
				<div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-neutral-900 mb-4">Blog</h1>
							<p className="text-xl text-neutral-600 mb-8">
								Our blog posts are coming soon. Stay tuned for insights and updates!
							</p>
						</div>
					</div>
				</div>
			)
		}

		if (posts.length === 0 && page > 1) {
			notFound()
		}

		return (
			<div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					{page === 1 && !category && featuredPosts.length > 0 && (
						<BlogHero featuredPosts={featuredPosts} />
					)}

					{/* Categories Filter */}
					{categories.length > 0 && (
						<BlogCategories
							categories={categories}
							selectedCategory={category}
						/>
					)}

					{/* Page Header */}
					<div className="text-center py-8">
						<h1 className="text-4xl font-bold text-neutral-900 mb-4">
							{category ? `${category} Posts` : 'All Posts'}
						</h1>
						{category && (
							<p className="text-lg text-neutral-600">
								Explore our {category.toLowerCase()} articles
							</p>
						)}
					</div>

					{/* Blog Posts Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
						{posts.map((post) => (
							<BlogPostCard key={post._id} post={post} />
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex justify-center items-center space-x-2 pb-16">
							{page > 1 && (
								<a
									href={`/blog?${new URLSearchParams({
										...(category && {category}),
										page: String(page - 1)
									})}`}
									className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
								>
									Previous
								</a>
							)}

							{Array.from({length: totalPages}, (_, i) => i + 1)
								.filter(pageNum => pageNum === 1 ||
									pageNum === totalPages ||
									(pageNum >= page - 2 && pageNum <= page + 2))
								.map((pageNum, index, array) => {
									// Add ellipsis if there's a gap
									const prevPageNum = array[index - 1]
									const showEllipsis = prevPageNum && pageNum - prevPageNum > 1

									return (
										<div key={pageNum} className="flex items-center">
											{showEllipsis && (
												<span className="px-2 text-neutral-500">...</span>
											)}
											<a
												href={`/blog?${new URLSearchParams({
													...(category && {category}),
													page: String(pageNum)
												})}`}
												className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
													pageNum === page
														? 'bg-blue-600 text-white'
														: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
												}`}
											>
												{pageNum}
											</a>
										</div>
									)
								})}

							{page < totalPages && (
								<a
									href={`/blog?${new URLSearchParams({
										...(category && {category}),
										page: String(page + 1)
									})}`}
									className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
								>
									Next
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		)
	} catch (error) {
		notFound()
	}
}

export default BlogPage
