'use client'

import PostCard, {Post} from '@/app/(website)/changes/PostCard'
import {AnimatePresence} from 'motion/react'
import {cn} from '@/lib/utils'

const PostsList = ({posts, className}: {posts: Post[], className?: string}) => {
	return (
		<AnimatePresence>
			<div className={cn('space-y-12 lg:space-y-20', className)}>
				{posts.map((post) => (
					<PostCard post={post} key={post.id} />
				))}
			</div>
		</AnimatePresence>
	)
}

export default PostsList
