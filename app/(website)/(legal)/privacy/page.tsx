import {Metadata} from 'next'
import {Cookie, EyeOff, Link as LinkIcon, Lock, ShieldCheck, Trash2} from 'lucide-react'
import LetrazBrainImage from '@/public/brain.png'
import Image from 'next/image'

export const metadata: Metadata = {
	title: 'Privacy Policy — Letraz',
	description:
		'How Letraz collects, uses, and protects your data, including resumes, profile information, and analytics.'
}

const PrivacyPolicyPage = () => {
	const effectiveDate = 'August 15, 2025'

	return (
		<main className="min-h-[80vh] bg-white">
			<Image
				src={LetrazBrainImage}
				alt="An artistic representation of the intelligence behind Letraz, the Letraz brain"
				className="absolute left-1/2 -translate-x-1/2 -top-[900px] blur-lg"
			/>

			<section className="max-w-3xl mx-auto px-6 lg:px-0 py-16 pt-48 relative z-10">
				<h1 className="text-5xl font-bold tracking-tight mb-6 text-center mx-auto">Privacy Policy</h1>
				<p className="text-sm mb-20 text-center mx-auto opacity-80">Effective {effectiveDate}</p>

				{/* Key highlights users care about */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<ShieldCheck className="text-flame-600" size={20} />
							<h3 className="font-semibold">We never sell your data</h3>
						</div>
						<p className="text-sm opacity-80">Your personal and resume information is not sold to third parties.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<EyeOff className="text-flame-600" size={20} />
							<h3 className="font-semibold">No AI training on your content</h3>
						</div>
						<p className="text-sm text-neutral-600">We only use your data to provide and improve Letraz—not to train generalized AI models.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<Trash2 className="text-flame-600" size={20} />
							<h3 className="font-semibold">Easy deletion</h3>
						</div>
						<p className="text-sm text-neutral-600">Live data is deleted immediately on account closure; backups auto-delete within 30 days.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<LinkIcon className="text-flame-600" size={20} />
							<h3 className="font-semibold">You control sharing</h3>
						</div>
						<p className="text-sm text-neutral-600">Shareable resume links are optional and can be revoked at any time.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<Cookie className="text-flame-600" size={20} />
							<h3 className="font-semibold">Cookie & analytics choice</h3>
						</div>
						<p className="text-sm text-neutral-600">Cookie banner supported. Analytics run only on our production domain and can be limited.</p>
					</div>

					<div className="rounded-xl border border-neutral-200 p-5 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<Lock className="text-flame-600" size={20} />
							<h3 className="font-semibold">Security-first</h3>
						</div>
						<p className="text-sm text-neutral-600">Encryption in transit and at rest (for sensitive data). We notify of breaches without undue delay.</p>
					</div>
				</div>

				<p className="mb-6">
					This Privacy Policy explains how Letraz (operated by <strong>Quelac Studios Private Limited</strong>)
					collects, uses, and protects your information. Letraz helps job seekers create tailored, ATS-friendly
					resumes for each job application. By using Letraz, you agree to this policy.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Information we collect</h2>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Account and authentication</strong>: We use Clerk to authenticate you. Clerk provides us
						with a unique user ID and associated profile data you choose to share, such as name, email, optional
						phone number, and profile image.
					</li>
					<li>
						<strong>Profile and resume data</strong>: Details you enter to build resumes (e.g., first and last
						name, email, phone, address, city, postal code, nationality, website, professional summary/profile,
						education, work experience, projects, skills, certifications, and date ranges). When you upload a
						resume file for parsing, we process the file to extract structured data.
					</li>
					<li>
						<strong>Onboarding metadata</strong>: We store non-sensitive onboarding progress (e.g., current step,
						completed steps) to guide you through setup.
					</li>
					<li>
						<strong>Usage, analytics, and diagnostics</strong>: We use PostHog for product analytics (page views,
						events, device/browser info) and Sentry for error tracking and session replay with masking enabled.
						These tools may receive your Clerk user ID and basic attributes (e.g., email, name) for coherent
						debugging and product improvement. We use Knock for in-app notifications.
					</li>
					<li>
						<strong>Public sharing features</strong> (planned): If you choose to create shareable resume links,
						the content you publish via those links may be publicly accessible. You can revoke sharing at any time.
					</li>
					<li>
						<strong>Cookies</strong>: Essential cookies for authentication and session management, and analytic
						cookies to understand product usage. See “Your choices” below.
					</li>
				</ul>

				<h2 className="text-xl font-semibold mt-10 mb-3">How we use your information</h2>
				<ul className="list-disc pl-6 space-y-2">
					<li>Provide and secure the service, including authentication and authorization.</li>
					<li>Create, edit, and render resumes and related content you request.</li>
					<li>Operate features such as resume parsing, onboarding flow, and notifications.</li>
					<li>Improve reliability, performance, and user experience through analytics and error diagnostics.</li>
					<li>
						Improve the quality of the service and features. We do <strong>not</strong> use your resumes or account
						data to train generalized AI models or for unrelated research.
					</li>
					<li>Communicate with you about updates and important notices.</li>
				</ul>

				<h2 className="text-xl font-semibold mt-10 mb-3">Sharing and disclosure</h2>
				<p className="mb-4">We do not sell your personal information. We may share data with:</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>Service providers</strong>:
						Clerk (authentication), PostHog (analytics), Sentry (error monitoring and session replay with masking),
						Knock (notifications), Resend (transactional email), hosting (Vercel, Mumbai region), backend
						infrastructure (Singapore and Bangalore), storage/CDN (DigitalOcean Spaces, Singapore). These vendors
						process data on our behalf under contractual safeguards.
					</li>
					<li>
						<strong>Legal requirements</strong>: If required by law or to protect rights, safety, or the integrity
						of our services.
					</li>
				</ul>

				<h2 className="text-xl font-semibold mt-10 mb-3">Data retention</h2>
				<p className="mb-6">
					We retain your account and resume data while your account is active. Upon account closure, we delete
					live data immediately. Standard backups are retained for up to <strong>30 days</strong> and then deleted.
					We may retain limited information as required by law or for legitimate business purposes (e.g., security,
					fraud prevention, or legal compliance).
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Your choices and rights</h2>
				<ul className="list-disc pl-6 space-y-2 mb-6">
					<li><strong>Access, update, delete</strong>: Manage resume content in-app. Contact us to request account deletion.</li>
					<li><strong>Analytics</strong>: You can use browser settings, content blockers, or “Do Not Track” to limit analytics. PostHog is enabled only on our production domain.</li>
					<li><strong>Cookie preferences</strong>: We support a cookie banner. You may decline analytics cookies and still use essential features.</li>
					<li><strong>Emails</strong>: You can opt out of non-essential emails from within those messages when offered.</li>
				</ul>

				<h2 className="text-xl font-semibold mt-10 mb-3">Security</h2>
				<p className="mb-6">
					We implement administrative, technical, and organizational measures to protect your data, including
					encryption in transit and encryption at rest for sensitive data. No system is 100% secure, but we strive
					to safeguard your information against unauthorized access, disclosure, or loss. If we become aware of a
					security breach affecting your personal data, we will notify you <strong>without undue delay</strong>
					as required by applicable law.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">International data transfers</h2>
				<p className="mb-6">
					Our service and vendors may process data in multiple jurisdictions, including India (hosting), Singapore
					(backend and storage), and other locations required for delivery (e.g., CDN). Where required, we implement
					appropriate safeguards for cross-border transfers.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Children</h2>
				<p className="mb-6">
					Letraz is not directed to children under 16. If you believe a child has provided personal data, please
					contact us and we will take appropriate steps to remove such information.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Changes to this policy</h2>
				<p className="mb-6">
					We may update this policy from time to time. We will post the updated version on this page and update the
					effective date.
				</p>

				<h2 className="text-xl font-semibold mt-10 mb-3">Contact</h2>
				<p>
					For privacy requests or questions, contact <a className="text-flame-600 underline" href="mailto:subhajit@letraz.app">subhajit@letraz.app</a>
					or reach us via our{' '}
					<a className="text-flame-600 underline" href="https://discord.gg/jTkyKCYz2M" target="_blank" rel="noreferrer noopener">Discord community</a>.
				</p>
			</section>
		</main>
	)
}

export default PrivacyPolicyPage


