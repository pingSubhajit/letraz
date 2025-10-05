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

const AccountDeletedEmail = () => (
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
			<Preview>Letraz — Your account has been deleted</Preview>
			<Body>
				<Container
					className="shadow-2xl shadow-flame-300 mt-16 rounded-2xl p-8 border-t-4 border-flame-500 border-solid bg-neutral-50">
					<Img src="https://letraz.app/logo_mono.png" alt="Letraz logo" width="327.24" height="48"
						className="h-4 w-auto mx-auto"/>

					<Heading className="mt-6 mx-auto text-center text-2xl mb-4">We're sorry to see you go</Heading>

					<Section>
						<Text>Hi Subhajit,</Text>

						<Text>
							We’ve successfully deleted your Letraz account, along with all your personal data and resumes associated with it. Any other telemetry data along with information we kept to offer smooth service that are associated with your account will be deleted completely by the next week.
						</Text>

						<Text>
							We’re truly sorry to see you go — but we respect your decision. If you ever decide to come back, you can create a new account anytime and start fresh. Getting started second time is just as easy if not more.
						</Text>

						<Text>
							Before you go, if you don’t mind sharing — we’d love to know what made you leave. Your feedback helps us build a better Letraz for everyone. Simply reply to this email and we'll receive and work upon on your feedback.
						</Text>
					</Section>

					<Section className="space-y-0.5">
						<Text className="m-0">Best regards,</Text>
						<Text className="m-0">Subhajit</Text>
						<Link href="https://letraz.app" className="text-flame-500">
							<Text className="m-0">Website</Text>
						</Link>
					</Section>

					<Section className="mt-8 pt-4 border-t border-neutral-200">
						<Text className="text-xs opacity-40 text-center">
							You received this email because an account deletion was requested for your email address.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	</Tailwind>
)

export default AccountDeletedEmail
