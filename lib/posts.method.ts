'use server'

import {ghostBlogUrl} from '@/constants'

export const getPosts = async () => {
	const response = await fetch(`${ghostBlogUrl}/ghost/api/content/posts/?key=${process.env.GHOST_API_KEY!}&limit=all`)
	if (!response.ok) throw new Error('Failed to fetch posts')
	return await response.json()
}
