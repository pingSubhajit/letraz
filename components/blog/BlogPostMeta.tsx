'use client'

import * as React from 'react'
import {BlogAuthor} from '@/lib/basehub'
import {LinkedIn, Twitter} from '@ridemountainpig/svgl-react'
import {Button} from '@/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {cn} from '@/lib/utils'
import Image from 'next/image'

interface BlogPostAuthorsProps {
	authors: BlogAuthor[]
	publishedAt: string
	className?: string
}

export const BlogPostMeta: React.FC<BlogPostAuthorsProps> = ({authors, publishedAt, className}) => {
	const [openIndex, setOpenIndex] = React.useState<number | null>(null)

	return (
		<div className={cn('flex items-center justify-center', className)}>
			<div className="flex -space-x-2">
				{authors.map((author, index) => (
					<Popover
						key={author._id}
						open={openIndex === index}
						onOpenChange={(o) => setOpenIndex(o ? index : null)}
					>
						<PopoverTrigger asChild>
							{author.avatar ? (
								<Image
									src={author.avatar.url}
									alt={author.name}
									width="128" height="128"
									className="h-8 w-8 rounded-full ring-2 ring-white shadow cursor-pointer object-cover"
									onMouseEnter={() => setOpenIndex(index)}
									onMouseLeave={() => setOpenIndex(prev => (prev === index ? null : prev))}
								/>
							) : (
								<div
									className="h-8 w-8 text-xs rounded-full ring-2 ring-white shadow cursor-pointer bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium"
									onMouseEnter={() => setOpenIndex(index)}
									onMouseLeave={() => setOpenIndex(prev => (prev === index ? null : prev))}
								>
									{author.name?.charAt(0).toUpperCase()}
								</div>
							)}
						</PopoverTrigger>
						<PopoverContent
							align="start"
							side="top"
							className="w-52"
							onMouseEnter={() => setOpenIndex(index)}
							onMouseLeave={() => setOpenIndex(prev => (prev === index ? null : prev))}
						>
							<div className="flex flex-col items-center">
								{author.avatar ? (
									<Image
										width="128" height="128"
										src={author.avatar.url} alt={author.name}
										className="h-10 w-10 rounded-full object-cover"
									/>
								) : (
									<div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
										{author.name?.charAt(0).toUpperCase()}
									</div>
								)}

								<p className="font-semibold text-neutral-900 text-center mt-2 mb-1">{author.name}</p>

								{author.bio && (
									<p className="text-xs opacity-80 text-neutral-600 line-clamp-3 text-center">{author.bio}</p>
								)}

								<div className="flex items-center gap-2 w-full justify-center mt-3">
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
						</PopoverContent>
					</Popover>
				))}
			</div>
		</div>
	)
}
