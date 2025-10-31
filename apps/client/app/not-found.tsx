import {Link} from 'next-view-transitions'
import WebsiteNavBar from '@/components/WebsiteNavBar'
import navMenuBg from '@/public/nav_menu_bg.png'
import Image from 'next/image'

const NotFound = () => {
	return (
		<main className="relative">
			<WebsiteNavBar className="fixed top-0 right-7 lg:right-16 z-30 w-[calc(100vw-56px)] lg:w-[calc(100vw-128px)]" />

			<div className="w-screen h-svh flex justify-center items-center z-10">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-2xl font-medium text-center">404 — Not found</h1>
					<p className="text-neutral-700 max-w-xl text-center mt-4">
						We don't have this page, go to the <Link className="font-semibold" href="/">home page?</Link>
					</p>
				</div>
			</div>

			<Image
				priority={true}
				src={navMenuBg}
				alt="Background Image"
				className="absolute bottom-0 lg:-bottom-2/3 left-0 w-full -z-10"
			/>
		</main>
	)
}

export default NotFound
