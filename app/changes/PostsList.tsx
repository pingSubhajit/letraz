'use client'

import PostCard, {Post} from '@/app/changes/PostCard'
import {AnimatePresence} from 'framer-motion'
import {cn} from '@/lib/utils'

const PostsList = ({posts, className}: {posts: Post[], className?: string}) => {
	return (
		<AnimatePresence>
			<div className={cn('space-y-20', className)}>
				{posts.map((post) => (
					<PostCard post={post} key={post.id} />
				))}
			</div>
		</AnimatePresence>
	)
}

export default PostsList
