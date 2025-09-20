'use client'

import Link from 'next/link'
import {BlogPost} from '@/lib/basehub'
import {formatDistanceToNow} from 'date-fns'
import {defaultUrl} from '@/config'

interface BlogPostSidebarProps {
	post: BlogPost
	relatedPosts: BlogPost[]
}

export const BlogPostSidebar: React.FC<BlogPostSidebarProps> = ({
	post,
	relatedPosts
}) => {
	return (
		<aside className="space-y-8">
			{/* Table of Contents - This would need to be generated from the content */}
			<div className="sticky top-8">
				{/* Share Section */}
				<div className="bg-gray-50 rounded-xl p-6 mb-8">
					<h3 className="font-semibold text-gray-900 mb-4">Share this post</h3>
					<div className="flex space-x-3">
						<a
							href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${defaultUrl}/blog/${post.slug}`)}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center w-10 h-10 bg-flame-500 hover:bg-flame-600 text-white rounded-lg transition-colors"
							title="Share on Twitter"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
							</svg>
						</a>
						<a
							href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${defaultUrl}/blog/${post.slug}`)}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center w-10 h-10 bg-flame-700 hover:bg-flame-800 text-white rounded-lg transition-colors"
							title="Share on LinkedIn"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
							</svg>
						</a>
						<button
							onClick={() => {
								if (navigator.share) {
									navigator.share({
										title: post.title,
										text: post.excerpt,
										url: `/blog/${post.slug}`
									})
								} else {
									// Fallback: copy to clipboard
									navigator.clipboard.writeText(`${defaultUrl}/blog/${post.slug}`)
								}
							}}
							className="flex items-center justify-center w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
							title="Copy link"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</button>
					</div>
				</div>

				{/* Related Posts */}
				{relatedPosts.length > 0 && (
					<div className="bg-white border border-gray-200 rounded-xl p-6">
						<h3 className="font-semibold text-gray-900 mb-4">Related Posts</h3>
						<div className="space-y-4">
							{relatedPosts.map((relatedPost) => (
								<Link
									key={relatedPost._id}
									href={`/app/(website)/blog/${relatedPost.slug}`}
									className="block group"
								>
									<article className="space-y-2">
										<h4 className="font-medium text-gray-900 group-hover:text-flame-600 transition-colors line-clamp-2 text-sm">
											{relatedPost.title}
										</h4>
										<div className="flex items-center text-xs text-gray-500">
											<span>{relatedPost.author.name}</span>
											<span className="mx-2">•</span>
											<time dateTime={relatedPost.publishedAt}>
												{formatDistanceToNow(new Date(relatedPost.publishedAt), {addSuffix: true})}
											</time>
										</div>
									</article>
								</Link>
							))}
						</div>
						<div className="mt-4 pt-4 border-t border-gray-100">
							<Link
								href="/blog"
								className="text-sm text-flame-600 hover:text-flame-700 font-medium"
							>
								View all posts →
							</Link>
						</div>
					</div>
				)}
			</div>
		</aside>
	)
}
