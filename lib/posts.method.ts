'use server'

import {ghostBlogUrl} from '@/constants'
import {env} from '@/lib/env'


export const getPosts = async () => {
	const response = await fetch(`${ghostBlogUrl}/ghost/api/content/posts/?key=${env.GHOST_API_KEY!}&limit=all`)
	if (!response.ok) throw new Error('Failed to fetch posts')
	return await response.json()
}
