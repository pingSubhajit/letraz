'use server'

import GhostContentAPI from '@tryghost/content-api'
import {ghostBlogUrl} from '@/constants'

// Create API instance with site credentials
const ghost = new GhostContentAPI({
	url: ghostBlogUrl,
	key: process.env.GHOST_API_KEY!,
	version: 'v5.0'
})

export const getPosts = async () => {
	const response = await fetch(`${ghostBlogUrl}/ghost/api/content/posts/?key=${process.env.GHOST_API_KEY!}&limit=all`)
	if (!response.ok) throw new Error('Failed to fetch posts')
	return await response.json()
}

export const getSinglePost = async (postSlug: string) => await ghost.posts
	.read({
		slug: postSlug
	})
