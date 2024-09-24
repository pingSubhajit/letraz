import tailwindConfig from '@/tailwind.config'
import {
	Body,
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


export default function WaitlistWelcomeEmail() {
	return (
		<Tailwind config={tailwindConfig}>
			<Html>
				<Head>
					<Font
						fontFamily="Red Hat Display"
						fallbackFontFamily="Verdana"
						webFont={{
							url: 'https://fonts.gstatic.com/s/redhatdisplay/v19/8vIQ7wUr0m80wwYf0QCXZzYzUoTg_T6h.woff2',
							format: 'woff2',
						}}
						fontWeight='300 900'
						fontStyle="normal"
					/>
				</Head>
				<Preview>Letraz — Signed up for waitlist</Preview>
				<Body>
					<Container className="shadow-2xl shadow-flame-300 mt-16 rounded-2xl p-8 border-t-4 border-flame-500 border-solid bg-neutral-50">
						<Img src="https://letraz.app/logo_mono.png" alt="Letraz logo" width="327.24" height="48" className="h-4 w-auto mx-auto" />

						<Heading className="mt-6 mx-auto text-center text-2xl mb-12">Welcome to Letraz waitlist</Heading>

						<Text className="">
							Thank you for signing up for the Letraz waitlist! 🎉 We're thrilled to have you join us on
							this exciting journey toward transforming the job application process.
						</Text>

						<Text>
							Letraz is not just another resume builder – it's your personal job-application ally,
							designed to give you the edge over the competition. Here’s how:
						</Text>

						<Section>
							<Text className="font-bold text-base">✅ Tailored Resumes for Every Job</Text>
							<Text>
								No more generic resumes. Letraz tweaks and adjusts your resume based on the specific
								job you're applying for. Simply paste the job description link, and Letraz will craft
								a unique, ATS-friendly resume that highlights exactly what recruiters and hiring systems
								are looking for.
							</Text>
						</Section>

						<Section>
							<Text className="font-bold text-base">✅ No Hassle, Just Results</Text>
							<Text>
								Let our AI do the heavy lifting. Whether it’s fine-tuning the layout or spotlighting
								key skills for a particular role, Letraz makes sure your resume gets noticed, helping
								you get through the first round with ease.
							</Text>
						</Section>

						<Section>
							<Text>
								We're currently working hard to finalize the launch, and as someone on our waitlist,
								you'll be among the first to try Letraz once it's ready! 🎯
							</Text>

							<Text>
								Stay tuned for more updates. In the meantime, feel free to share Letraz with others
								who are ready to level up their job applications.
							</Text>
						</Section>

						<Text >
							Thanks again for joining us on this journey. We can't wait to show you what Letraz can do!
						</Text>

						<Section className="space-y-0.5">
							<Text className="m-0">Best regards,</Text>
							<Text className="m-0">The Letraz Team</Text>
							<Link href="https://letraz.app">Website</Link>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	)
}
