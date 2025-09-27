import footerWordmark from '@/public/footer-wordmark.svg'
import {Button} from '@/components/ui/button'
import {Link} from 'next-view-transitions'
import LandingPageLogo from '@/app/(website)/page.logo'
import {discordHandle, githubHandle, instagramHandle, linkedinHandle, twitterHandle} from '@/config'
import Image from 'next/image'

const WebsiteFooter = () => {
	return (
		<section className="relative">
			<div className="relative">
				<video
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
					className="absolute -bottom-[100%] left-1/2 -translate-x-1/2 max-w-7xl pointer-events-none">
					<source src="/brain-pulse.webm" type="video/webm"/>
				</video>
				<div className="bg-gradient-to-br from-flame-500 to-flame-700 px-16 py-24 relative rounded-2xl max-w-7xl mx-auto z-20 flex flex-col justify-center items-center gap-4">
					<h2 className="text-4xl text-neutral-50 text-center">Let's put your best foot forward</h2>
					<p className="text-lg text-neutral-200 text-center">Apply with confidence for every job with tailored resumes from Letraz</p>
					<Link href="/app"><Button variant="outline" size="lg" className="text-neutral-50">Get started</Button></Link>
				</div>
			</div>

			<div className="bg-neutral-950 relative z-10 p-24 pb-0">
				<div className="absolute inset-0 z-10 top-0 -translate-y-full h-32 bg-neutral-950" />

				<div className="relative z-10 w-full grid grid-cols-12 h-full gap-8 bg-neutral-950/50 pb-24 backdrop-blur">
					<div className="col-span-5 h-full">
						<LandingPageLogo className="mb-1" size="3xl" type="dark" />
						<p className="mt-2 text-neutral-300 text-sm">© 2025 Letraz. All rights reserved.</p>
					</div>

					<div />

					<div className="col-span-2">
						<p className="text-neutral-400 text-xs uppercase font-medium">Company</p>

						<ul className="mt-8 list-none text-neutral-300 flex flex-col gap-2 text-sm">
							<li><Link href="/app" className="hover:text-neutral-50 transition">Dashboard</Link></li>
							<li><Link href="/story" className="hover:text-neutral-50 transition">Story</Link></li>
							<li><Link href="/docs" className="hover:text-neutral-50 transition">Documentation</Link></li>
							<li><Link href="/blog" className="hover:text-neutral-50 transition">Blog</Link></li>
							<li><Link href="/changes" className="hover:text-neutral-50 transition">Changelog</Link></li>
							<li><Link href="/support" className="hover:text-neutral-50 transition">Support</Link></li>
						</ul>
					</div>

					<div className="col-span-2">
						<p className="text-neutral-400 text-xs uppercase font-medium">Legal</p>

						<ul className="mt-8 list-none text-neutral-300 flex flex-col gap-2 text-sm">
							<li><Link href="/privacy" className="hover:text-neutral-50 transition">Privacy policy</Link></li>
							<li><Link href="/terms" className="hover:text-neutral-50 transition">Terms of use</Link></li>
						</ul>
					</div>

					<div className="col-span-2">
						<p className="text-neutral-400 text-xs uppercase font-medium">Connect</p>

						<ul className="mt-8 list-none text-neutral-300 flex flex-col gap-2 text-sm">
							<li><a href={githubHandle} target="_blank" className="hover:text-neutral-50 transition">Github</a></li>
							<li><a href={discordHandle} target="_blank" className="hover:text-neutral-50 transition">Discord</a></li>
							<li><a href={twitterHandle} target="_blank" className="hover:text-neutral-50 transition">X (Twitter)</a></li>
							<li><a href={linkedinHandle} target="_blank" className="hover:text-neutral-50 transition">LinkedIn</a></li>
							<li><a href={instagramHandle} target="_blank" className="hover:text-neutral-50 transition">Instagram</a></li>
						</ul>
					</div>
				</div>

				<Image src={footerWordmark} alt="Big Letraz logo because it looks cool" className="w-full -translate-y-24 opacity-5" />
			</div>
		</section>
	)
}

export default WebsiteFooter
