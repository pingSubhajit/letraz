import {DocsNavigation} from './components/docs-navigation'
import {ScrollArea} from '@/components/ui/scroll-area'
import Image from 'next/image'
import logoImage from '@/public/logo_mono.svg'
import {cn} from '@/lib/utils'
import {Link} from 'next-view-transitions'
import {Button} from '@/components/ui/button'
import {Toolbar} from 'basehub/next-toolbar'

const DocumentationLayout = ({children}: {children: React.ReactNode}) => (
	<div className="">
		<div className="bg-neutral-50/70 backdrop-blur-lg w-full sticky top-0 z-10 border-b py-3 px-8 flex items-center justify-between">
			<Link href="/">
				<Image
					src={logoImage}
					alt="Letraz logo"
					className={cn('w-14 md:w-16 lg:w-20 xl:w-24 2xl:w-28')}
				/>
			</Link>

			<nav className="flex items-center gap-4">
				<Link href="/signin" className="opacity-80 font-medium hover:opacity-100 transition text-xs">Sign in</Link>
				<Link href="/signup"><Button className="h-8 text-xs" size="sm">Get started</Button></Link>
			</nav>
		</div>

		<div
			className="flex-1 items-start px-8
			md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]
			lg:gap-8 [&>*]:font-jakarta"

		>
			{/* Sidebar */}
			<aside className="fixed top-20 z-30 hidden w-full shrink-0 md:sticky md:block">
				<ScrollArea className="h-full">
					<DocsNavigation />
				</ScrollArea>
			</aside>

			{/* Main Content */}
			<main className="relative border-l pl-8 pt-8">
				<div className="mx-auto w-full min-w-0 pb-16">
					{children}

					{/* Basehub Toolbar */}
					<Toolbar />
				</div>
			</main>
		</div>
	</div>
)

export default DocumentationLayout
