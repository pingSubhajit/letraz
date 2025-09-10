import {notFound, redirect} from 'next/navigation'
import {getDocumentationPages} from '@/lib/basehub'

export const dynamic = 'force-static'

/*
 * Using BaseHub's automatic on-demand revalidation instead of ISR
 * Do not set revalidate as it conflicts with BaseHub's caching system
 */

const DocumentationHome = async () => {
	let hierarchicalPages

	try {
		// Get all documentation pages from BaseHub
		hierarchicalPages = await getDocumentationPages()
	} catch (error) {
		notFound()
	}

	if (hierarchicalPages.length === 0) {
		// If no pages are found, show a 404
		notFound()
	}

	/*
	 * Find the first published page to redirect to
	 * Priority: first category with children, then first standalone page
	 */
	const firstPage = hierarchicalPages[0]

	if (!firstPage || !firstPage.slug) {
		notFound()
	}

	/*
	 * Redirect to the first documentation page
	 * Don't wrap this in try-catch as redirect() throws NEXT_REDIRECT internally
	 */
	redirect(`/docs/${firstPage.slug}`)
}

export default DocumentationHome
