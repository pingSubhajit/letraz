import {Link} from 'next-view-transitions'
import navMenuBg from '@/public/nav_menu_bg.png'
import Image from 'next/image'

const ResumeNotFound = () => {
	return (
		<div className="h-svh w-full flex items-center justify-center relative overflow-y-clip">
			<div className="text-center max-w-xl px-6">
				<h1 className="text-2xl font-medium">Resume not found</h1>
				<p className="text-neutral-700 mt-4">
					We couldn't find this resume. Go back to your{' '}
					<Link className="font-semibold" href="/app">workspace</Link>?
				</p>
			</div>

			<Image
				priority={true}
				src={navMenuBg}
				alt="Background Image"
				className="absolute bottom-0 lg:-bottom-2/3 left-0 w-full -z-10"
			/>
		</div>
	)
}

export default ResumeNotFound
