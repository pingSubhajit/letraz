import Image from 'next/image'
import LetrazBrainImage from '@/public/brain.webp'

interface LegalLayoutProps {
	children: React.ReactNode
}

const LegalLayout = ({ children }: LegalLayoutProps) => {
	return (
		<main className="min-h-[80vh] bg-white">
			<Image
				src={LetrazBrainImage}
				alt="" aria-hidden
				className="absolute left-1/2 -translate-x-1/2 -top-[900px] blur-lg"
			/>

			<section className="max-w-3xl mx-auto px-6 lg:px-0 py-16 pt-48 relative z-10">
				{children}
			</section>
		</main>
	)
}

export default LegalLayout
