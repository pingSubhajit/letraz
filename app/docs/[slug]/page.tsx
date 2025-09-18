import React from 'react'
import {notFound} from 'next/navigation'
import {getAllDocumentationPages, getBreadcrumbPath, getDocumentationPage, getPageNavigation} from '@/lib/basehub'
import {Separator} from '@/components/ui/separator'
import Link from 'next/link'
import {ArrowLeft, ChevronLeft, ChevronRight} from 'lucide-react'
import TableOfContents from '@/app/docs/components/table-of-contents'
import sanitizeHtml from 'sanitize-html'

/*
 * Using BaseHub's automatic on-demand revalidation instead of ISR
 * Do not set revalidate as it conflicts with BaseHub's caching system
 */

interface DocPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static paths for all documentation pages
export const generateStaticParams = async () => {
	try {
		const pages = await getAllDocumentationPages()
		return pages.map((page) => ({
			slug: page.slug
		}))
	} catch (error) {
		return []
	}
}

// Generate metadata for each page
export const generateMetadata = async ({params}: DocPageProps) => {
	const {slug} = await params
	const page = await getDocumentationPage(slug)

	if (!page) {
		return {
			title: 'Page Not Found'
		}
	}

	return {
		title: `${page.title} | Documentation`,
		description: page.description
	}
}

const IndividualDocumentationPage = async ({params}: DocPageProps) => {
	const {slug} = await params
	const [page, breadcrumbPath, navigation] = await Promise.all([
		getDocumentationPage(slug),
		getBreadcrumbPath(slug),
		getPageNavigation(slug)
	])

	if (!page) {
		notFound()
	}

	const sanitizedBody = page.body
		? sanitizeHtml(page.body, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([
				'img',
				'video',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
				'pre',
				'code',
				'span'
			]),
			allowedAttributes: {
				'*': ['id', 'class', 'style'],
				a: ['href', 'name', 'target', 'rel'],
				img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
				video: ['src', 'controls', 'autoplay', 'loop', 'muted', 'playsinline', 'poster', 'width', 'height'],
				code: ['class']
			},
			allowedSchemesByTag: {
				img: ['http', 'https', 'data'],
				video: ['http', 'https']
			}
		})
		: ''

	return (
		<div className="flex w-full justify-center">
			<div className="flex max-w-6xl w-full gap-16">
				{/* Main content */}
				<div className="flex-1 min-w-0 max-w-[65ch]">
					<div>
						{/* Breadcrumbs */}
						<nav className="flex items-center space-x-1 text-sm text-muted-foreground">
							<Link href="/docs" className="hover:text-foreground transition-colors">
								<ArrowLeft className="h-4 w-4" />
							</Link>
							<ChevronRight className="h-4 w-4" />
							<Link href="/docs" className="hover:text-foreground transition-colors">
								Documentation
							</Link>

							{/* Hierarchical breadcrumb path */}
							{breadcrumbPath.map((breadcrumbPage, index) => {
								const isLast = index === breadcrumbPath.length - 1
								return (
									<React.Fragment key={breadcrumbPage._id}>
										<ChevronRight className="h-4 w-4" />
										{isLast ? (
											<span className="text-foreground font-medium">{breadcrumbPage.title}</span>
										) : (
											<Link
												href={`/docs/${breadcrumbPage.slug}`}
												className="hover:text-foreground transition-colors"
											>
												{breadcrumbPage.title}
											</Link>
										)}
									</React.Fragment>
								)
							})}
						</nav>

						{/* Page header */}
						<div className="mt-4 space-y-3">
							<h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
								{page.title}
							</h1>
							{page.description && (
								<p className="text-xl text-muted-foreground">
									{page.description}
								</p>
							)}
						</div>
					</div>

					{/* Page content */}
					<div className="mt-12">
						{page.body ? (
							<div
								dangerouslySetInnerHTML={{__html: sanitizedBody}}
								className="docs-content prose [&_li>p]:my-0 [&>img]:rounded-2xl [&>video]:rounded-2xl"
							/>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<p>This page has no content yet.</p>
							</div>
						)}
					</div>

					{/* Show navigation if previous or next pages are available */}
					<Separator className="mt-16 mb-8" />
					{(navigation.previous || navigation.next) && (
						<div className="grid gap-4 md:grid-cols-2 max-w-[65ch]">
							{navigation.previous && (
								<Link
									href={`/docs/${navigation.previous.slug}`}
									className="hover:text-flame-500 transition font-medium"
								>
									<ChevronLeft className="mr-1.5 h-4 w-4 inline" />
									{navigation.previous.title}
								</Link>
							)}
							{navigation.next && (
								<Link
									href={`/docs/${navigation.next.slug}`}
									className="hover:text-flame-500 transition font-medium flex items-center justify-end md:col-start-2"
								>
									{navigation.next.title}
									<ChevronRight className="ml-1.5 h-4 w-4 inline" />
								</Link>
							)}
						</div>
					)}
				</div>

				{/* Table of Contents - Only show on larger screens and when there's content */}
				{page.body && (
					<div className="hidden xl:block">
						<div className="sticky top-24 overflow-hidden">
							<TableOfContents content={sanitizedBody} />
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default IndividualDocumentationPage
