import tailwindConfig from '@/tailwind.config'
import {
	Body,
	Button,
	Container,
	Font,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components'
import * as React from 'react'

const FollowUpAccessEmail = () => (
	<Tailwind config={tailwindConfig}>
		<Html>
			<Head>
				<Font
					fontFamily="Red Hat Display"
					fallbackFontFamily="Verdana"
					webFont={{
						url: 'https://fonts.gstatic.com/s/redhatdisplay/v19/8vIQ7wUr0m80wwYf0QCXZzYzUoTg_T6h.woff2',
						format: 'woff2'
					}}
					fontWeight="300 900"
					fontStyle="normal"
				/>
			</Head>
			<Preview>Letraz — Your beta access is waiting for you</Preview>
			<Body>
				<Container
					className="shadow-2xl shadow-flame-300 mt-16 rounded-2xl p-8 border-t-4 border-flame-500 border-solid bg-neutral-50">
					<Img src="https://letraz.app/logo_mono.png" alt="Letraz logo" width="327.24" height="48"
						className="h-4 w-auto mx-auto"/>

					<Heading className="mt-6 mx-auto text-center text-2xl mb-12">Your Letraz access is still waiting</Heading>

					<Text className="">
						Hey there! 👋 We noticed you haven’t signed in to Letraz yet — but your early access is still active! 🎉
						As one of our waitlist members, you've been invited to try the exclusive closed beta of Letraz before anyone else.
					</Text>

					<Text>
						Letraz helps you create tailored, job-specific resumes in seconds — no more generic templates
						or hours tweaking bullet points.
					</Text>

					<Section className="">
						<Text className="text-base">
							🔓 Here’s what you’re missing out on:
						</Text>

						<Text className="m-1">🎯 <strong>Generate tailored resumes</strong> for any job in minutes</Text>
						<Text className="m-1">📈 <strong>Beat ATS systems</strong> with optimized formatting and keywords</Text>
						<Text className="m-1">💼 <strong>Manage multiple resume versions</strong> for different roles</Text>
						<Text className="m-1">🚀 <strong>Stand out from other candidates</strong> with AI-powered optimization</Text>
					</Section>

					<Section className="my-8">
						<Text className="text-center">
							Maybe life got in the way? No worries – your access is still active and waiting for you.
							It takes less than 2 minutes to get started.
						</Text>

						<Button
							className="box-border w-full rounded-full bg-flame-500 px-[12px] py-[12px] text-center font-semibold text-white"
							href="https://letraz.app/app"
						>
							Start building my resume now
						</Button>

						<p className="text-xs opacity-40 font-semibold text-center">(Use the same email address you signed up with)</p>
					</Section>


					<Section>
						<Text>
							If you're facing any issues or have questions about getting started, just reply to this email.
							I'm here to help make sure you get the most out of your early access!
						</Text>

						<Text>
							Spots are limited and the beta won’t stay open forever — grab yours before it’s gone.
						</Text>
					</Section>

					<Section className="space-y-0.5">
						<Text className="m-0">Let’s get to work,</Text>
						<Text className="m-0">Subhajit</Text>
						<Link href="https://letraz.app" className="text-flame-500">
							<Text className="m-0">Website</Text>
						</Link>
					</Section>

					<Section className="mt-8 pt-4 border-t border-neutral-200">
						<Text className="text-xs opacity-40 text-center">
							P.S. If you're no longer interested in job searching or prefer not to receive these emails,
							don't worry we won't email you after this one if you don't decide to sign up
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	</Tailwind>
)

export default FollowUpAccessEmail
