import Link from 'next/link'
import {BlogPost} from '@/lib/basehub'
import {BlogPostMeta} from '@/components/blog/BlogPostMeta'
import {cn} from '@/lib/utils'

interface BlogPostCardProps {
	post: BlogPost
	featured?: boolean
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({post, featured = false}) => {
	const imageHeight = featured ? 'h-64 sm:h-80' : 'h-48'

	return (
		<Link href={`/blog/${post.slug}`} className="block h-full">
			<article className="group cursor-pointer overflow-hidden h-full">
				{/* Cover Image */}
				{post.coverImage && (
					<div className={cn(`relative w-full ${imageHeight} overflow-hidden`, featured ? 'rounded-2xl border-4' : 'rounded-xl border-2')}>
						<img
							src={post.coverImage.url}
							alt={post.title}
							className="w-full h-full object-cover transition-transform duration-300"
						/>
						{post.featured && (
							<div className="absolute top-4 left-4 bg-flame-600 text-white text-xs px-2 py-1 rounded-full font-medium">
								Featured
							</div>
						)}
					</div>
				)}

				{/* Content */}
				<div className="">
					{/* Title */}
					<h3 className={cn(
						'font-bold text-neutral-900 group-hover:text-flame-600 transition-colors mb-3 line-clamp-2',
						featured ? 'text-2xl mt-6' : 'text-lg mt-4'
					)}>
						{post.title}
					</h3>

					{/* Excerpt */}
					{featured && <p className="text-neutral-600 line-clamp-3 text-base">
						{post.excerpt}
					</p>}

					{/* Authors and Date */}
					<div className="flex items-center justify-between mt-4">
						<BlogPostMeta isList={true} authors={post.authors} publishedAt={post.publishedAt} />
					</div>
				</div>
			</article>
		</Link>
	)
}
