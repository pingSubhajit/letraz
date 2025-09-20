import Link from 'next/link'
import {BlogPost} from '@/lib/basehub'
import {formatDistanceToNow} from 'date-fns'

interface BlogPostCardProps {
	post: BlogPost
	featured?: boolean
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({post, featured = false}) => {
	const formattedDate = formatDistanceToNow(new Date(post.publishedAt), {addSuffix: true})

	const cardClasses = featured
		? 'group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full'
		: 'group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full'

	const imageHeight = featured ? 'h-64 sm:h-80' : 'h-48'

	return (
		<Link href={`/blog/${post.slug}`} className="block h-full">
			<article className={cardClasses}>
				{/* Cover Image */}
				{post.coverImage && (
					<div className={`relative w-full ${imageHeight} overflow-hidden`}>
						<img
							src={post.coverImage.url}
							alt={post.title}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						/>
						{post.featured && (
							<div className="absolute top-4 left-4 bg-flame-600 text-white text-xs px-2 py-1 rounded-full font-medium">
								Featured
							</div>
						)}
						{post.category && (
							<div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
								{post.category}
							</div>
						)}
					</div>
				)}

				{/* Content */}
				<div className={featured ? 'p-8' : 'p-6'}>
					{/* Category and Date - only show if no cover image */}
					{!post.coverImage && (
						<div className="flex items-center justify-between mb-3">
							{post.category && (
								<span className="bg-flame-100 text-flame-800 text-xs px-2 py-1 rounded-full font-medium">
									{post.category}
								</span>
							)}
							<time className="text-sm text-gray-500" dateTime={post.publishedAt}>
								{formattedDate}
							</time>
						</div>
					)}

					{/* Title */}
						<h3 className={`font-bold text-gray-900 group-hover:text-flame-600 transition-colors mb-3 line-clamp-2 ${
						featured ? 'text-2xl' : 'text-lg'
					}`}>
						{post.title}
					</h3>

					{/* Excerpt */}
					<p className={`text-gray-600 mb-4 line-clamp-3 ${
						featured ? 'text-base' : 'text-sm'
					}`}>
						{post.excerpt}
					</p>

					{/* Author and Date */}
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							{post.author.avatar ? (
								<img
									src={post.author.avatar.url}
									alt={post.author.name}
									className="w-8 h-8 rounded-full mr-3"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
									<span className="text-gray-600 text-sm font-medium">
										{post.author.name.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
							<div>
								<p className="text-sm font-medium text-gray-900">{post.author.name}</p>
								{post.coverImage && (
									<p className="text-xs text-gray-500">{formattedDate}</p>
								)}
							</div>
						</div>

						{/* Tags */}
						{post.tags && post.tags.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{post.tags.slice(0, 2).map((tag) => (
									<span
										key={tag}
										className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
									>
										{tag}
									</span>
								))}
								{post.tags.length > 2 && (
									<span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
								)}
							</div>
						)}
					</div>
				</div>
			</article>
		</Link>
	)
}
