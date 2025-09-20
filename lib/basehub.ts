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

// ============ BLOG TYPES ============

export interface BlogAuthor {
	_id: string
	name: string
	bio?: string
	email?: string
	twitterHandle?: string
	linkedinUrl?: string
	avatar?: {
		url: string
	}
}

export interface BlogPost {
	_id: string
	title: string
	slug: string
	excerpt: string
	publishedAt: string
	coverImage?: {
		url: string
	}
	authors: BlogAuthor[]
	category?: string
	tags?: string[]
	content: {
		html: string
	}
	published: boolean
	featured: boolean
}

// ============ BLOG FUNCTIONS ============

export const getBlogPosts = async (options?: {
	limit?: number
	offset?: number
	featured?: boolean
	category?: string
}): Promise<{ posts: BlogPost[], total: number }> => {
	try {
		const limit = options?.limit || 10
		const offset = options?.offset || 0

		const filterConditions: any = {
			published: true
		}

		if (options?.featured) {
			filterConditions.featured = true
		}

		/*
		 * NOTE: BaseHub SelectFilter operators vary by schema version; to avoid
		 * build/runtime incompatibilities, perform category filtering in JS below.
		 */
		const applyCategoryFilterInJs = Boolean(options?.category)

		const queryArgs: any = {
			filter: filterConditions,
			orderBy: 'publishedAt__DESC',
			first: applyCategoryFilterInJs ? 1000 : limit,
			skip: applyCategoryFilterInJs ? 0 : offset
		}

		const data = await basehub({
			token: process.env.BASEHUB_TOKEN,
			draft: false // Explicitly use published content during build
		}).query({
			blogPosts: {
				__args: queryArgs,
				items: {
					_id: true,
					title: true,
					slug: true,
					excerpt: true,
					publishedAt: true,
					coverImage: {
						url: true
					},
					author: {
						_id: true,
						name: true,
						bio: true,
						avatar: {
							url: true
						}
					},
					category: true,
					tags: true,
					content: {
						html: true
					},
					published: true,
					featured: true
				}
			}
		})

		const items = (data as any).blogPosts?.items || []
		let posts: BlogPost[] = items.map((post: any) => ({
			_id: post._id,
			title: post.title || '',
			slug: post.slug || '',
			excerpt: post.excerpt || '',
			publishedAt: post.publishedAt || '',
			coverImage: post.coverImage ? {
				url: post.coverImage.url
			} : undefined,
			authors: Array.isArray(post.author) ? post.author.map((author: any) => ({
				_id: author._id,
				name: author.name || '',
				bio: author.bio || '',
				avatar: author.avatar ? {
					url: author.avatar.url
				} : undefined
			})) : [{
				_id: post.author._id,
				name: post.author.name || '',
				bio: post.author.bio || '',
				avatar: post.author.avatar ? {
					url: post.author.avatar.url
				} : undefined
			}],
			category: post.category || undefined,
			tags: post.tags || [],
			content: {
				html: post.content?.html || ''
			},
			published: post.published || false,
			featured: post.featured || false
		}))

		// Apply category filtering and pagination in JS when needed
		if (applyCategoryFilterInJs && options?.category) {
			posts = posts.filter(p => p.category === options.category)
			const total = posts.length
			const paginated = posts.slice(offset, offset + limit)
			return {posts: paginated, total}
		}

		return {posts, total: posts.length}
	} catch (error) {
		return {posts: [], total: 0}
	}
}

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
	try {
		const data = await basehub({
			token: process.env.BASEHUB_TOKEN,
			draft: false // Explicitly use published content
		}).query({
			blogPosts: {
				__args: {
					filter: {
						slug: {eq: slug},
						published: true
					},
					first: 1
				},
				items: {
					_id: true,
					title: true,
					slug: true,
					excerpt: true,
					publishedAt: true,
					coverImage: {
						url: true
					},
					author: {
						_id: true,
						name: true,
						bio: true,
						email: true,
						twitterHandle: true,
						linkedinUrl: true,
						avatar: {
							url: true
						}
					},
					category: true,
					tags: true,
					content: {
						html: true
					},
					published: true,
					featured: true
				}
			}
		})

		const post = (data as any).blogPosts?.items?.[0]

		if (!post) return null

		return {
			_id: post._id,
			title: post.title || '',
			slug: post.slug || '',
			excerpt: post.excerpt || '',
			publishedAt: post.publishedAt || '',
			coverImage: post.coverImage ? {
				url: post.coverImage.url
			} : undefined,
			authors: Array.isArray(post.author) ? post.author.map((author: any) => ({
				_id: author._id,
				name: author.name || '',
				bio: author.bio || '',
				email: author.email || '',
				twitterHandle: author.twitterHandle || '',
				linkedinUrl: author.linkedinUrl || '',
				avatar: author.avatar ? {
					url: author.avatar.url
				} : undefined
			})) : [{
				_id: post.author._id,
				name: post.author.name || '',
				bio: post.author.bio || '',
				email: post.author.email || '',
				twitterHandle: post.author.twitterHandle || '',
				linkedinUrl: post.author.linkedinUrl || '',
				avatar: post.author.avatar ? {
					url: post.author.avatar.url
				} : undefined
			}],
			category: post.category || undefined,
			tags: post.tags || [],
			content: {
				html: post.content?.html || ''
			},
			published: post.published || false,
			featured: post.featured || false
		}
	} catch (error) {
		return null
	}
}

export const getFeaturedBlogPosts = async (limit: number = 3): Promise<BlogPost[]> => {
	const {posts} = await getBlogPosts({featured: true, limit})
	return posts
}

export const getRecentBlogPosts = async (limit: number = 5): Promise<BlogPost[]> => {
	const {posts} = await getBlogPosts({limit})
	return posts
}

export const getBlogCategories = async (): Promise<string[]> => {
	try {
		const {posts} = await getBlogPosts({limit: 1000})
		const categories = new Set<string>()

		posts.forEach(post => {
			if (post.category) categories.add(post.category)
		})

		return Array.from(categories).sort()
	} catch (error) {
		return []
	}
}
