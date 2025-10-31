import {Toolbar} from 'basehub/next-toolbar'
import {ReactNode} from 'react'

const BlogLayout = ({children}: {children: ReactNode}) => {
	return (
		<>
			{children}
			{/* Basehub Toolbar for on-demand revalidation across the site */}
			<Toolbar />
		</>
	)
}

export default BlogLayout
