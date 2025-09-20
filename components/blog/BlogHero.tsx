import {BlogPost} from '@/lib/basehub'
import {BlogPostCard} from './BlogPostCard'

interface BlogHeroProps {
	featuredPosts: BlogPost[]
}

export const BlogHero: React.FC<BlogHeroProps> = ({featuredPosts}) => {
	if (featuredPosts.length === 0) {
		return null
	}

	const mainPost = featuredPosts[0]
	const sidePosts = featuredPosts.slice(1, 3)

	return (
		<section className="py-12">
			{/* Hero Header */}
			<div className="text-center mb-12">
				<h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-6">
					Latest from our blog
				</h1>
				<p className="text-xl text-neutral-600 max-w-2xl mx-auto">
					Insights, updates, and stories from the Letraz team. Discover the latest in AI-powered resume building and career development.
				</p>
			</div>

			{/* Featured Posts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
				{/* Main Featured Post */}
				<div className="lg:col-span-2">
					<BlogPostCard post={mainPost} featured={true} />
				</div>

				{/* Side Posts */}
				{sidePosts.length > 0 && (
					<div className="space-y-6">
						{sidePosts.map((post) => (
							<BlogPostCard key={post._id} post={post} />
						))}
					</div>
				)}
			</div>

			{/* Divider */}
			<div className="border-t border-neutral-200 pt-12">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-neutral-900 mb-2">More from our blog</h2>
					<p className="text-neutral-600">Explore all our articles and insights</p>
				</div>
			</div>
		</section>
	)
}
