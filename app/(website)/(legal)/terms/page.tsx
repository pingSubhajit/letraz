import {Metadata} from 'next'
import {EyeOff, Lock, ShieldCheck} from 'lucide-react'
import LetrazBrainImage from '@/public/brain.png'
import Image from 'next/image'

export const metadata: Metadata = {
	title: 'Terms of Use — Letraz',
	description: 'The rules and conditions for using Letraz.'
}

const TermsOfUsePage = () => {
	const effectiveDate = 'August 15, 2025'

	return (
		<main className="min-h-[80vh] bg-white">
			<Image
				src={LetrazBrainImage}
				alt="" aria-hidden
				className="absolute left-1/2 -translate-x-1/2 -top-[900px] blur-lg"
			/>

			<section className="max-w-3xl mx-auto px-6 lg:px-0 py-16 pt-48 relative z-10">
				<h1 className="text-5xl font-bold tracking-tight mb-6 text-center mx-auto">Terms of Use</h1>
				<p className="text-sm mb-20 text-center mx-auto opacity-80">Effective {effectiveDate}</p>

				{/* Key highlights users care about */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<EyeOff className="text-flame-600" size={20} aria-hidden />
							<h3 className="font-semibold">AS IS and availability</h3>
						</div>
						<p className="text-sm opacity-80">The service is provided “AS IS” and “AS AVAILABLE” without warranties.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<Lock className="text-flame-600" size={20} aria-hidden />
							<h3 className="font-semibold">Limited liability</h3>
						</div>
						<p className="text-sm opacity-80">Our liability is limited to the maximum extent permitted by law.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<Lock className="text-flame-600" size={20} aria-hidden />
							<h3 className="font-semibold">Acceptable use</h3>
						</div>
						<p className="text-sm opacity-80">Don’t upload unlawful content, abuse share links, or disrupt the service.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<ShieldCheck className="text-flame-600" size={20} aria-hidden />
							<h3 className="font-semibold">Governing law & venue</h3>
						</div>
						<p className="text-sm opacity-80">These Terms are governed by Indian law and subject to courts in India.</p>
					</div>
				</div>

				<p className="mb-6">
					These Terms of Use ("Terms") govern your access to and use of Letraz, operated by
					<strong> Quelac Studios Private Limited</strong>. By using Letraz, you agree to these Terms. If you do not
					agree, do not use the service.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Service description</h2>
				<p className="mb-6">
					Letraz helps you craft tailored, ATS-friendly resumes and related materials. Certain features may rely on
					third-party services (e.g., authentication, analytics, notifications, email delivery) that operate under
					their own terms and policies.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Eligibility</h2>
				<p className="mb-6">You must be at least 16 years old to use Letraz. We do not target school-age children.</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Your account</h2>
				<ul className="list-disc pl-6 space-y-2 mb-6">
					<li>You are responsible for your account and for maintaining its security.</li>
					<li>Provide accurate information and do not impersonate others.</li>
					<li>We use Clerk for authentication; your use of Clerk is subject to Clerk’s terms and privacy policy.</li>
				</ul>

				<h2 className="text-xl font-semibold mt-10 mb-3">Acceptable use</h2>
				<ul className="list-disc pl-6 space-y-2 mb-6">
					<li>Do not upload unlawful, harmful, defamatory, or infringing content.</li>
					<li>Do not attempt to reverse engineer, disrupt, or harm the service.</li>
					<li>Do not use Letraz to generate misleading or deceptive materials.</li>
					<li>Do not abuse shareable resume links; treat public links as potentially accessible on the open internet.</li>
				</ul>

				<h2 className="text-xl font-semibold mt-10 mb-3">Your content</h2>
				<p className="mb-6">
					You retain ownership of the content you submit (e.g., resumes, experience descriptions, projects, skills).
					You grant Letraz a limited, worldwide, non-exclusive license to host, process, and display your content
					solely to provide the service and operate product features you use, including optional shareable links that
					you enable and can revoke at any time.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Intellectual property</h2>
				<p className="mb-6">
					Letraz, its design, and proprietary elements are owned by us or our licensors and protected by
					applicable laws. These Terms do not grant you rights to our trademarks or branding.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Third-party services</h2>
				<p className="mb-6">
					We integrate with vendors such as Clerk (auth), PostHog (analytics), Sentry (monitoring), Knock
					(notifications), and Resend (email), and rely on hosting/infrastructure in India (Vercel, Mumbai region),
					backend services in Singapore and Bangalore, and storage/CDN in Singapore (DigitalOcean Spaces). Their
					services are governed by their own terms and privacy policies.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Disclaimers</h2>
				<p className="mb-6">
					The service is provided on an “AS IS” and “AS AVAILABLE” basis. We do not guarantee that resumes will lead
					to interviews or offers, nor do we warrant uninterrupted or error-free operation.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Limitation of liability</h2>
				<p className="mb-6">
					To the maximum extent permitted by law, Letraz and its affiliates are not liable for indirect, incidental,
					special, consequential, or punitive damages, or any loss of profits, revenues, data, or use, arising from or
					related to your use of the service.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Termination</h2>
				<p className="mb-6">
					You may stop using Letraz at any time. We may suspend or terminate access if you violate these Terms or if
					we believe your use poses risk to other users or the service. Upon termination, your rights to access the
					service cease. We may retain certain information as required by law or for legitimate business purposes.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Changes to the service or terms</h2>
				<p className="mb-6">
					We may modify or discontinue features, and we may update these Terms. If changes are material, we will
					provide notice by posting the updated Terms with a new effective date.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Governing law</h2>
				<p className="mb-6">
					These Terms are governed by and construed in accordance with the laws of India, without regard to its
					conflict of law provisions. You agree to submit to the exclusive jurisdiction of competent courts in India
					for any disputes arising out of or relating to these Terms or the service.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Contact</h2>
				<p>
					Questions about these Terms? Contact <a className="text-flame-600 underline" href="mailto:subhajit@letraz.app">subhajit@letraz.app</a> or
					reach us via our{' '}<a className="text-flame-600 underline" href="https://discord.gg/jTkyKCYz2M" target="_blank" rel="noreferrer noopener">Discord community</a>.
				</p>
			</section>
		</main>
	)
}

export default TermsOfUsePage


