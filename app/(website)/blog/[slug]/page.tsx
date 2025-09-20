import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getBlogPost, getBlogPosts, getRecentBlogPosts} from '@/lib/basehub'
import {BlogPostContent} from '@/components/blog/BlogPostContent'
import {BlogPostAuthor} from '@/components/blog/BlogPostAuthor'
import {BlogPostSidebar} from '@/components/blog/BlogPostSidebar'

export const dynamic = 'force-static'

interface BlogPostPageProps {
	params: Promise<{
		slug: string
	}>
}

export const generateMetadata = async ({params}: BlogPostPageProps): Promise<Metadata> => {
	const {slug} = await params
	const post = await getBlogPost(slug)

	if (!post) {
		return {
			title: 'Post Not Found'
		}
	}

	return {
		title: `${post.title}`,
		description: post.excerpt,
		openGraph: {
			title: post.title,
			description: post.excerpt,
			type: 'article',
			publishedTime: post.publishedAt,
			authors: [post.author.name],
			...(post.coverImage && {
				images: [
					{
						url: post.coverImage.url,
						alt: post.title
					}
				]
			})
		},
		twitter: {
			card: 'summary_large_image',
			title: post.title,
			description: post.excerpt,
			...(post.coverImage && {
				images: [post.coverImage.url]
			})
		}
	}
}

// Pre-render all blog post slugs at build time (like docs)
export const generateStaticParams = async () => {
	try {
		const {posts} = await getBlogPosts({limit: 1000})
		return posts.map(post => ({slug: post.slug}))
	} catch (error) {
		return []
	}
}

const BlogPostPage = async ({params}: BlogPostPageProps) => {
	try {
		const {slug} = await params
		// Fetch the blog post and related posts in parallel
		const [post, recentPosts] = await Promise.all([
			getBlogPost(slug),
			getRecentBlogPosts(5)
		])

		if (!post) {
			notFound()
		}

		// Filter out the current post from recent posts
		const relatedPosts = recentPosts.filter(p => p._id !== post._id).slice(0, 3)

		return (
			<div className="min-h-screen pt-32">
				{/* Article Header */}
				<article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
					{/* Meta information */}
					<div className="w-full mb-6">
						{/* Category */}
						{post.category && (
							<p className="text-center text-sm font-medium">
								{post.category}
							</p>
						)}
					</div>

					{/* Title */}
					<h1 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-neutral-900 leading-none text-center">
						{post.title}
					</h1>

					{/* Excerpt */}
					{post.excerpt && <p className="text-center mt-4 max-w-2xl mx-auto opacity-70">
						{post.excerpt}
					</p>}

					{/* Author info */}
					<BlogPostAuthor author={post.author} publishedAt={post.publishedAt} className="mt-10 mb-10" />

					{/* Cover image */}
					{post.coverImage && (
						<div className="relative w-full h-96 sm:h-[500px] rounded-xl overflow-hidden mb-8">
							<img
								src={post.coverImage.url}
								alt={post.title}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{/* Content */}
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						<div className="lg:col-span-3">
							<BlogPostContent content={post.content.html} />
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1">
							<BlogPostSidebar
								post={post}
								relatedPosts={relatedPosts}
							/>
						</div>
					</div>

					{/* Footer */}
					<footer className="border-t border-gray-200 pt-8 mt-12 mb-16">
						<div className="flex flex-wrap items-center justify-between">
							{/* Tags */}
							{post.tags && post.tags.length > 0 && (
								<div className="flex flex-wrap items-center mb-4 lg:mb-0">
									<span className="text-sm font-medium text-gray-700 mr-3">Tags:</span>
									{post.tags.map((tag) => (
										<span
											key={tag}
											className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-2 mb-2"
										>
											{tag}
										</span>
									))}
								</div>
							)}

							{/* Share buttons could go here */}
							<div className="flex items-center space-x-4">
								<span className="text-sm text-gray-500">Share this post</span>
								{/* Social share buttons would be implemented here */}
							</div>
						</div>
					</footer>
				</article>
			</div>
		)
	} catch (error) {
		notFound()
	}
}

export default BlogPostPage
