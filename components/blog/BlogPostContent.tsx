interface BlogPostContentProps {
	content: string
}

export const BlogPostContent: React.FC<BlogPostContentProps> = ({content}) => {
	return (
		<div
			className="prose prose-neutral max-w-none
				prose-headings:text-neutral-900 prose-headings:font-bold
				prose-h1:text-3xl prose-h1:mb-8 prose-h1:mt-12
				prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-10
				prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-8
				prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:mb-6
				prose-a:text-flame-600 prose-a:no-underline hover:prose-a:underline
				prose-strong:text-neutral-900 prose-strong:font-semibold
				prose-ul:mb-6 prose-ol:mb-6
				prose-li:text-neutral-700 prose-li:mb-2
				prose-blockquote:border-l-4 prose-blockquote:border-flame-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-neutral-600
				prose-code:bg-neutral-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-neutral-800
				prose-pre:bg-neutral-900 prose-pre:text-white prose-pre:rounded-lg prose-pre:p-6 prose-pre:overflow-x-auto
				prose-img:rounded-lg prose-img:shadow-lg prose-img:mb-8
				prose-hr:border-neutral-200 prose-hr:my-12 [&_li>p]:my-0 [&>img]:rounded-2xl [&>video]:rounded-2xl
			"
			dangerouslySetInnerHTML={{__html: content}}
		/>
	)
}
