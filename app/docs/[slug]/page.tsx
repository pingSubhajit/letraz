import React from 'react'
import {notFound} from 'next/navigation'
import {getAllDocumentationPages, getBreadcrumbPath, getDocumentationPage} from '@/lib/basehub'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Separator} from '@/components/ui/separator'
import Link from 'next/link'
import {ArrowLeft, Calendar, ChevronRight, FileText} from 'lucide-react'
import TableOfContents from '@/app/docs/components/table-of-contents'

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
	const [page, breadcrumbPath] = await Promise.all([
		getDocumentationPage(slug),
		getBreadcrumbPath(slug)
	])

	if (!page) {
		notFound()
	}

	// Determine if this is a category or guide based on children
	const hasChildren = !!(page.children && page.children.length > 0)
	const pageType = hasChildren ? 'Category' : 'Guide'

	return (
		<div className="flex w-full">
			{/* Main content */}
			<div className="flex-1 min-w-0 max-w-4xl">
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
					<div className="mt-6 space-y-4">
						<div className="space-y-2">
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
				</div>

				{/* Page content */}
				<div className="mt-8">
					{page.body ? (
						<div
							dangerouslySetInnerHTML={{__html: page.body}}
							className="prose [&_li>p]:my-0"
						/>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							<p>This page has no content yet.</p>
							{hasChildren && (
								<p className="mt-2">Explore the guides below to get started.</p>
							)}
						</div>
					)}
				</div>

				{/* Show child pages if this is a category */}
				{hasChildren && (
					<div className="space-y-4">
						<Separator />
						<div>
							<h3 className="text-lg font-semibold mb-4">Guides in this section</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{page.children!.map((child) => (
									<Card key={child._id} className="group relative overflow-hidden">
										<CardContent className="p-4">
											<div className="flex items-center justify-between mb-2">
												<Badge variant="outline">Guide</Badge>
											</div>
											<h4 className="font-medium mb-2">
												<Link
													href={`/docs/${child.slug}`}
													className="hover:text-blue-600 after:absolute after:inset-0"
												>
													<FileText className="mr-2 h-4 w-4 inline" />
													{child.title}
												</Link>
											</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{child.description}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Page footer */}
				<div className="border-t pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								<span>Last updated today</span>
							</div>
						</div>

						<div className="flex gap-2">
							<Button variant="outline" size="sm" asChild>
								<Link href="/docs">
									All Documentation
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Table of Contents - Only show on larger screens and when there's content */}
			{page.body && (
				<div className="hidden xl:block xl:pl-8">
					<div className="sticky top-24 overflow-hidden">
						<TableOfContents content={page.body} />
					</div>
				</div>
			)}
		</div>
	)
}

export default IndividualDocumentationPage
