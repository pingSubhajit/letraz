import {DocsNavigation} from './components/docs-navigation'
import {ScrollArea} from '@/components/ui/scroll-area'

const DocumentationLayout = ({children}: {children: React.ReactNode}) => (
	<div className="">
		<div className="bg-flame-300 w-full h-16 sticky top-0 z-10">

		</div>

		<div
			className="flex-1 items-start px-8
			md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]
			lg:gap-8 [&>*]:font-jakarta"

		>
			{/* Sidebar */}
			<aside className="fixed top-24 z-30 hidden w-full shrink-0 md:sticky md:block">
				<ScrollArea className="h-full">
					<DocsNavigation />
				</ScrollArea>
			</aside>

			{/* Main Content */}
			<main className="relative border-l pl-8 pt-8">
				<div className="mx-auto w-full min-w-0 pb-16">
					{children}
				</div>
			</main>
		</div>
	</div>
)

export default DocumentationLayout
