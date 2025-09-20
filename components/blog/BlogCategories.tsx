import Link from 'next/link'

interface BlogCategoriesProps {
	categories: string[]
	selectedCategory?: string
}

export const BlogCategories: React.FC<BlogCategoriesProps> = ({
	categories,
	selectedCategory
}) => {
	if (categories.length === 0) {
		return null
	}

	return (
		<section className="py-8 border-b border-gray-200">
			<div className="flex flex-wrap items-center justify-center gap-3">
				{/* All Posts */}
				<Link
					href="/blog"
					className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
						!selectedCategory
							? 'bg-flame-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						{category}
					</Link>
				))}
			</div>
		</section>
	)
}
