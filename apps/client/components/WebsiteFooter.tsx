import footerWordmark from '@/public/footer-wordmark.svg'
import {Button} from '@/components/ui/button'
import {Link} from 'next-view-transitions'
import LandingPageLogo from '@/app/(website)/page.logo'
import {discordHandle, githubHandle, instagramHandle, linkedinHandle, twitterHandle} from '@/config'
import Image from 'next/image'

const WebsiteFooter = () => {
	return (
		<section className="relative sm:px-0 lg:px-0">
			<div className="relative max-w-7xl mx-auto">
				<video
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
					className="hidden lg:block absolute lg:-bottom-[85%] xl:-bottom-[100%] lg:scale-100 opacity-100 left-1/2 -translate-x-1/2  w-full max-w-7xl pointer-events-none">
					<source src="/brain-pulse.webm" type="video/webm"/>
				</video>
				<div className="bg-gradient-to-br from-flame-500 to-flame-700 px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-24 relative sm:rounded-2xl z-20 flex flex-col justify-center items-center gap-3 sm:gap-4 text-center">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl text-neutral-50">Let's put your best foot forward</h2>
					<p className="text-sm sm:text-base lg:text-lg text-neutral-100/90 max-w-2xl">Apply with confidence for every job with tailored resumes from Letraz</p>
					<Link href="/app">
						<Button variant="outline" size="lg" className="text-neutral-50 border-neutral-50/40 hover:border-neutral-50 hover:bg-neutral-950/10">
							Get started
						</Button>
					</Link>
				</div>
			</div>

			<div className="bg-neutral-950 relative z-10 mt-12 sm:mt-16 lg:mt-24 px-6 sm:px-8 lg:px-24 pt-16 sm:pt-20 lg:pt-24 pb-0">
				<div className="absolute inset-0 z-10 top-0 -translate-y-full h-32 bg-neutral-950" />

				<div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 h-full gap-10 sm:gap-12 lg:gap-8 bg-neutral-950/70 backdrop-blur rounded-t-3xl sm:rounded-t-[32px] pb-16 sm:pb-20 lg:pb-24">
					<div className="sm:col-span-3 lg:col-span-5 flex flex-col gap-3">
						<LandingPageLogo className="mb-1" size="3xl" type="dark" />
						<p className="text-neutral-400 text-sm leading-relaxed max-w-sm">© 2025 Letraz. All rights reserved.</p>
					</div>

					<div className="hidden lg:block lg:col-span-1" />

					<div className="sm:col-span-1 lg:col-span-2">
						<p className="text-neutral-400 text-xs uppercase tracking-wide font-medium">Company</p>

						<ul className="mt-6 sm:mt-8 list-none text-neutral-300 flex flex-col gap-2 text-sm">
							<li><Link href="/app" className="hover:text-neutral-50 transition">Dashboard</Link></li>
							<li><Link href="/story" className="hover:text-neutral-50 transition">Story</Link></li>
							<li><Link href="/docs" className="hover:text-neutral-50 transition">Documentation</Link></li>
							<li className="hidden sm:block"><Link href="/blog" className="hover:text-neutral-50 transition">Blog</Link></li>
							<li><Link href="/changes" className="hover:text-neutral-50 transition">Changelog</Link></li>
						</ul>
					</div>

					<div className="sm:col-span-1 lg:col-span-2">
						<p className="text-neutral-400 text-xs uppercase tracking-wide font-medium">Legal</p>

						<ul className="mt-6 sm:mt-8 list-none text-neutral-300 flex flex-col gap-2 text-sm">
							<li><Link href="/privacy" className="hover:text-neutral-50 transition">Privacy policy</Link></li>
							<li><Link href="/terms" className="hover:text-neutral-50 transition">Terms of use</Link></li>
						</ul>
					</div>

					<div className="sm:col-span-1 lg:col-span-2">
						<p className="text-neutral-400 text-xs uppercase tracking-wide font-medium">Connect</p>

						<ul className="mt-6 sm:mt-8 list-none text-neutral-300 flex flex-col gap-2 text-sm">
							<li><a href={githubHandle} target="_blank" className="hover:text-neutral-50 transition">GitHub</a></li>
							<li><a href={discordHandle} target="_blank" className="hover:text-neutral-50 transition">Discord</a></li>
							<li><a href={twitterHandle} target="_blank" className="hover:text-neutral-50 transition">X (Twitter)</a></li>
							<li><a href={linkedinHandle} target="_blank" className="hover:text-neutral-50 transition">LinkedIn</a></li>
							<li><a href={instagramHandle} target="_blank" className="hover:text-neutral-50 transition">Instagram</a></li>
						</ul>
					</div>
				</div>

				<Image src={footerWordmark} alt="Big Letraz logo because it looks cool" className="w-full -translate-y-6 sm:-translate-y-20 lg:-translate-y-24 opacity-5" />
			</div>
		</section>
	)
}

export default WebsiteFooter
