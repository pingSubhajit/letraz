import {NextRequest, NextResponse} from 'next/server'
import {getPosts} from '@/lib/posts.method'
import {defaultUrl, discordAnnouncementChannelId, discordBotUrl} from '@/config'
import TurndownService from 'turndown'
import {revalidatePath} from 'next/cache'

export const POST = async (req: NextRequest) => {
	try {
		revalidatePath('/changes')
		const post = (await getPosts()).posts[0]
		const turndownService = new TurndownService()
		const response = await fetch(`${discordBotUrl}/main/announcement`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.DISCORD_BOT_TOKEN}`
			},
			body: JSON.stringify({
				image_url: post.feature_image,
				title: post.title,
				message_content: turndownService.turndown(post.html),
				learn_more: `${defaultUrl}/changes`,
				channel_id: discordAnnouncementChannelId
			})
		})
		const botResponse = await response.json()

		if (botResponse.status !== 'Success') {
			throw new Error('Failed to send announcement')
		}

		return NextResponse.json({message: 'Success'})
	} catch (error: any) {
		return NextResponse.json({message: 'Failed'}, {status: 400})
	}
}
