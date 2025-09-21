import Link from 'next/link'
import {cn} from '@/lib/utils'

interface BlogCategoriesProps {
	categories: string[]
	selectedCategory?: string
	className?: string
}

export const BlogCategories: React.FC<BlogCategoriesProps> = ({
	categories,
	selectedCategory,
	className
}) => {
	if (categories.length === 0) {
		return null
	}

	return (
		<section className={cn(className)}>
			<div className="flex flex-wrap items-center gap-3">
				{/* All Posts */}
				<Link
					href="/blog"
					className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
						!selectedCategory
							? 'bg-flame-600 text-white'
							: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
					}`}
				>
					All Posts
				</Link>

				{/* Category Filters */}
				{categories.map((category) => (
					<Link
						key={category}
						href={`/blog?category=${encodeURIComponent(category)}`}
						className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
							selectedCategory === category
								? 'bg-flame-600 text-white'
								: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
						}`}
					>
						{category}
					</Link>
				))}
			</div>
		</section>
	)
}
