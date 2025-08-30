import {DocsNavigation} from './components/docs-navigation'
import {ScrollArea} from '@/components/ui/scroll-area'
import './documentation.css'

const DocumentationLayout = ({children}: {children: React.ReactNode}) => (
	<div className="space-y-8">
		<div className="bg-flame-300 w-full h-16">

		</div>

		<div
			className="flex-1 items-start px-8
			md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]
			lg:gap-8 [&>*]:font-jakarta"

		>
			{/* Sidebar */}
			<aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
				<ScrollArea className="h-full">
					<DocsNavigation/>
				</ScrollArea>
			</aside>

			{/* Main Content */}
			<main className="relative">
				<div className="mx-auto w-full min-w-0">
					{children}
				</div>
			</main>
		</div>
	</div>
)

export default DocumentationLayout
