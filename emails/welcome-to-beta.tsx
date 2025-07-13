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

const WelcomeToBetaEmail = () => (
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
			<Preview>Letraz Beta Is Waiting for You — Don’t Miss Out</Preview>
			<Body>
				<Container
					className="shadow-2xl shadow-flame-300 mt-16 rounded-2xl p-8 border-t-4 border-flame-500 border-solid bg-neutral-50">
					<Img src="https://letraz.app/logo_mono.png" alt="Letraz logo" width="327.24" height="48"
						className="h-4 w-auto mx-auto"/>

					<Heading className="mt-6 mx-auto text-center text-2xl mb-12">Welcome to Letraz</Heading>

					<Text className="">
						The wait is over — and we’re excited to officially welcome you into the Letraz Closed Beta! 🚀
						You’re among the first select few to get hands-on access to Letraz, your AI-powered resume-building ally.
					</Text>

					<Text>
						Letraz is designed to give you an edge in every job application. With your early access, you
						can now:
					</Text>

					<Section className="">
						<Text className="m-2">✅ <strong>Generate tailored, ATS-friendly resumes</strong> for specific job descriptions –
							just paste the job link or JD</Text>
						<Text className="m-2">✅ <strong>Save and manage multiple versions</strong> of your resume with ease</Text>
						<Text className="m-2">✅ <strong>Instantly highlight key skills and achievements</strong> aligned with each role</Text>
						<Text className="m-2">✅ <strong>Preview, fine-tune, and download</strong> your resumes with zero hassle</Text>
					</Section>

					<Section className="my-8">
						<Text className="text-center">
							This is just the beginning. Your feedback will help shape the future of Letraz, and we’re
							counting on your insights to make it even better.
						</Text>

						<Button
							className="box-border w-full rounded-full bg-flame-500 px-[12px] py-[12px] text-center font-semibold text-white"
							href="https://letraz.app/app"
						>
							Get started
						</Button>

						<p className="text-xs opacity-40 font-semibold text-center">(Use the same email you signed up with to access your beta account.)</p>
					</Section>

					<Section>
						<Text>
							Got questions or spot a bug? Just hit reply or drop us a message in
							our <a href="https://discord.gg/jTkyKCYz2M"></a>Discord server or directly from the
							app — we’d love to hear from you.
						</Text>

						<Text>
							Thanks again for joining us early. Let’s level up your job hunt, together. 🙌
						</Text>
					</Section>

					<Section className="space-y-0.5">
						<Text className="m-0">Best regards,</Text>
						<Text className="m-0">Subhajit</Text>
						<Link href="https://letraz.app" className="text-flame-500">
							<Text className="m-0">Website</Text>
						</Link>
					</Section>
				</Container>
			</Body>
		</Html>
	</Tailwind>
)

export default WelcomeToBetaEmail
