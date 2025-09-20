import {BlogAuthor} from '@/lib/basehub'
import {format} from 'date-fns'
import {LinkedIn, Twitter} from '@ridemountainpig/svgl-react'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

interface BlogPostAuthorProps {
	author: BlogAuthor
	publishedAt: string
	className?: string
}

export const BlogPostAuthor: React.FC<BlogPostAuthorProps> = ({author, publishedAt, className}) => {
	const formattedDate = format(new Date(publishedAt), 'MMMM d, yyyy')

	return (
		<div className={cn('flex items-center justify-center', className)}>
			{/* Author Avatar */}
			{author.avatar ? (
				<img
					src={author.avatar.url}
					alt={author.name}
					className="w-12 h-12 rounded-full mr-4"
				/>
			) : (
				<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
					<span className="text-gray-600 font-medium text-lg">
						{author.name.charAt(0).toUpperCase()}
					</span>
				</div>
			)}

			{/* Author Info */}
			<div>
				<div className="flex items-center">
					<h3 className="font-semibold text-gray-900 mr-2 text-lg">{author.name}</h3>
					{/* Social Links */}
					<div className="flex items-center space-x-2">
						{author.twitterHandle && (
							<a
								href={`https://twitter.com/${author.twitterHandle}`}
								target="_blank"
								rel="noopener noreferrer"
								title={`Follow ${author.name} on Twitter`}
							>
								<Button variant="ghost" size="icon" className="w-min h-min">
									<Twitter className="w-4 h-4" />
								</Button>
							</a>
						)}
						{author.linkedinUrl && (
							<a
								href={author.linkedinUrl}
								target="_blank"
								rel="noopener noreferrer"
								title={`Connect with ${author.name} on LinkedIn`}
							>
								<Button variant="ghost" size="icon" className="w-min h-min">
									<LinkedIn className="w-4 h-4" />
								</Button>
							</a>
						)}
					</div>
				</div>
				<time className="text-sm text-gray-500" dateTime={publishedAt}>
					{formattedDate}
				</time>
			</div>
		</div>
	)
}
