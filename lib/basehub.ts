import {basehub} from 'basehub'

export interface DocPage {
  _id: string
  title: string
  slug: string
  description?: string
  body?: string
  published: boolean
  children?: DocPage[]
}

export interface NavItem {
  _id: string
  label: string
  href?: string
  order: number
  icon?: string
  pageRef?: {
    _id: string
    slug: string
  }
}

/**
 * Get all documentation pages from BaseHub with hierarchy
 */
export const getDocumentationPages = async (): Promise<DocPage[]> => {
	try {
		const data = await basehub({
			token: process.env.BASEHUB_TOKEN
		}).query({
			documentationPages: {
				items: {
					_id: true,
					title: true,
					slug: true,
					description: true,
					body: {
						html: true
					},
					published: true,
					children: {
						items: {
							_id: true,
							title: true,
							slug: true,
							description: true,
							body: {
								html: true
							},
							published: true,
							children: {
								items: {
									_id: true,
									title: true,
									slug: true,
									description: true,
									body: {
										html: true
									},
									published: true
								}
							}
						}
					}
				}
			}
		})

		const transformPage = (page: any): DocPage => ({
			_id: page._id,
			title: page.title || '',
			slug: page.slug || '',
			description: page.description || '',
			body: page.body?.html || '',
			published: page.published || false,
			children: page.children?.items
				?.filter((child: any) => child.published)
				?.map(transformPage) || []
		})

		const items = (data as any).documentationPages?.items || []
		const pages = items
			?.filter((page: any) => page.published)
			?.map(transformPage) || []

		return pages
	} catch (error) {
		// Return empty array to prevent build failures
		return []
	}
}

/**
 * Get a single documentation page by slug using new hierarchical structure
 */
export const getDocumentationPage = async (slug: string): Promise<DocPage | null> => {
	try {
		// First try to find in top-level pages
		const data = await basehub({
			token: process.env.BASEHUB_TOKEN
		}).query({
			documentationPages: {
				__args: {
					filter: {
						slug: {eq: slug}
					},
					first: 1
				},
				items: {
					_id: true,
					title: true,
					slug: true,
					description: true,
					body: {
						html: true
					},
					published: true,
					children: {
						items: {
							_id: true,
							title: true,
							slug: true,
							description: true,
							body: {
								html: true
							},
							published: true
						}
					}
				}
			}
		})

		let page = (data as any).documentationPages?.items?.[0]
		if (page && page.published) {
			return {
				_id: page._id,
				title: page.title || '',
				slug: page.slug || '',
				description: page.description || '',
				body: page.body?.html || '',
				published: page.published || false,
				children: page.children?.items
					?.filter((child: any) => child.published)
					?.map((child: any) => ({
						_id: child._id,
						title: child.title || '',
						slug: child.slug || '',
						description: child.description || '',
						body: child.body?.html || '',
						published: child.published || false
					})) || []
			}
		}

		// If not found at top level, search in children
		const allPages = await getDocumentationPages()
		for (const parentPage of allPages) {
			const childPage = findPageBySlugRecursive(parentPage, slug)
			if (childPage) return childPage
		}

		return null
	} catch (error) {
		return null
	}
}

/**
 * Recursively search for a page by slug in the hierarchy
 */
const findPageBySlugRecursive = (page: DocPage, slug: string): DocPage | null => {
	if (page.slug === slug) return page

	if (page.children) {
		for (const child of page.children) {
			const found = findPageBySlugRecursive(child, slug)
			if (found) return found
		}
	}

	return null
}

/**
 * Get all pages in a flat list for search functionality
 */
export const getAllDocumentationPages = async (): Promise<DocPage[]> => {
	try {
		const hierarchicalPages = await getDocumentationPages()
		const flatPages: DocPage[] = []

		const flattenPages = (pages: DocPage[]) => {
			for (const page of pages) {
				flatPages.push({
					...page,
					children: undefined // Remove children for flat list
				})
				if (page.children && page.children.length > 0) {
					flattenPages(page.children)
				}
			}
		}

		flattenPages(hierarchicalPages)
		return flatPages
	} catch (error) {
		return []
	}
}

/**
 * Find the breadcrumb path to a given page slug in the hierarchical structure
 */
export const getBreadcrumbPath = async (targetSlug: string): Promise<DocPage[]> => {
	try {
		const hierarchicalPages = await getDocumentationPages()

		const findPath = (pages: DocPage[], path: DocPage[] = []): DocPage[] | null => {
			for (const page of pages) {
				const currentPath = [...path, page]

				// If we found the target page, return the path
				if (page.slug === targetSlug) {
					return currentPath
				}

				// If this page has children, search recursively
				if (page.children && page.children.length > 0) {
					const result = findPath(page.children, currentPath)
					if (result) return result
				}
			}
			return null
		}

		const path = findPath(hierarchicalPages)
		return path || []
	} catch (error) {
		return []
	}
}

/**
 * Get navigation context (previous/next pages) for a given page slug
 */
export const getPageNavigation = async (currentSlug: string): Promise<{
	previous: DocPage | null
	next: DocPage | null
}> => {
	try {
		// Get all pages in a flat, ordered list
		const allPages = await getAllDocumentationPages()

		// Find the current page index
		const currentIndex = allPages.findIndex(page => page.slug === currentSlug)

		if (currentIndex === -1) {
			return {previous: null, next: null}
		}

		return {
			previous: currentIndex > 0 ? allPages[currentIndex - 1] : null,
			next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null
		}
	} catch (error) {
		return {previous: null, next: null}
	}
}
