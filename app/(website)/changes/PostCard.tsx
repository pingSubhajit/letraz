'use client'

import {cn} from '@/lib/utils'
import {DateTime} from 'luxon'
import {motion} from 'motion/react'

export type Post = {
	id: string,
	uuid: string,
	title: string,
	slug: string,
	html: string,
	comment_id: string,
	feature_image: string,
	featured: boolean,
	visibility: 'public' | 'private',
	created_at: string,
	updated_at: string,
	published_at: string,
	custom_excerpt?: string,
	codeinjection_head?: string,
	codeinjection_foot?: string,
	custom_template?: string,
	canoncial_url?: string,
	url: string,
	excerpt: string,
	reading_time: number,
	access: boolean,
	comments: boolean,
	og_image?: string,
	og_title?: string,
	og_description?: string,
	twitter_image?: string,
	twitter_title?: string,
	twitter_description?: string,
	meta_title?: string,
	meta_description?: string,
	email_subject?: string,
	frontmatter?: string,
	feature_image_alt?: string,
	feature_image_caption?: string,
}

const PostCard = ({post, className}: {post: Post, className?: string}) => {
	return (
		<motion.div
			className={cn('', className)}
			initial={{opacity: 0}}
			whileInView={{opacity: 1}}
			exit={{opacity: 0}}
			transition={{duration: 0.5}}
		>
			<div className="flex items-start gap-2">
				<span className="mt-2 bg-flame-500 px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs text-neutral-50 rounded-full font-light">New</span>
				<h2 className="text-lg lg:text-3xl tracking-tight">{post.title}</h2>
			</div>

			<img src={post.feature_image} alt={post.title} className="max-w-full mt-8 rounded-md" />

			<div
				className="mt-8 opacity-80 prose-sm lg:prose xl:prose-lg prose-orange prose-a:text-flame-500 max-w-none tracking-tight"
				dangerouslySetInnerHTML={{__html: post.html}}
			/>
			<p className="mt-4 opacity-60 text-neutral-800 text-sm">
				on {DateTime.fromISO(post.published_at).setZone('gmt').setLocale('en-US').toLocaleString({weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
			</p>
		</motion.div>
	)
}

export default PostCard
