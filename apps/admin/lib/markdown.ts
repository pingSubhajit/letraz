import {marked} from 'marked'

export const markdownToHtml = (markdown: string) => {
	return marked(markdown, {
		gfm: true, // GitHub Flavored Markdown
		breaks: true, // Convert \n to <br>
		// @ts-ignore
		sanitize: false, // Allow HTML
		headerIds: false // Don't add IDs to headers
	})
}
